//src/llm/client.rs

use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::{BufRead, BufReader};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::Emitter;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Converts an array of ChatMessages into a ChatML-formatted prompt string.
pub fn build_prompt(messages: &[ChatMessage]) -> String {
    let mut prompt = String::new();
    for msg in messages {
        let role = match msg.role.as_str() {
            "system" | "user" | "assistant" => msg.role.as_str(),
            _ => "user",
        };
        prompt.push_str(&format!(
            "<|im_start|>{}\n{}<|im_end|>\n",
            role, msg.content
        ));
    }
    prompt.push_str("<|im_start|>assistant\n");
    prompt
}

/// Calls the llama.cpp /completion endpoint with streaming SSE.
///
/// - Emits "token" for each text chunk.
/// - Emits "token_end" with the full accumulated response when done.
/// - Checks `cancel` on every token; stops cleanly when set to `true`.
pub fn stream_completion(
    app: &tauri::AppHandle,
    prompt: String,
    max_tokens: u32,
    temperature: f32,
    cancel: Arc<AtomicBool>,
) -> Result<(), String> {
    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(120))
        .build()
        .map_err(|e| format!("Failed to build HTTP client: {}", e))?;

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": max_tokens,
            "temperature": temperature,
            // Stop tokens for common model families
            "stop": ["<|im_end|>", "<|endoftext|>", "</s>", "[/INST]"],
            "stream": true
        }))
        .send()
        .map_err(|e| {
            format!(
                "Connection error: {}. Is llama.cpp running on port 8080?",
                e
            )
        })?;

    let reader = BufReader::new(res);
    let mut full = String::new();

    for line in reader.lines().flatten() {
        // Honour cancellation between tokens
        if cancel.load(Ordering::SeqCst) {
            let _ = app.emit("token_end", &full);
            return Ok(());
        }

        if !line.starts_with("data: ") {
            continue;
        }

        let json_part = line.trim_start_matches("data: ").trim();

        if json_part == "[DONE]" {
            break;
        }

        if let Ok(data) = serde_json::from_str::<serde_json::Value>(json_part) {
            if let Some(token) = data["content"].as_str() {
                if !token.is_empty() {
                    full.push_str(token);
                    let _ = app.emit("token", token);
                }
            }

            // llama.cpp sets stop:true on the final chunk
            if data["stop"].as_bool().unwrap_or(false) {
                break;
            }
        }
    }

    let _ = app.emit("token_end", &full);
    Ok(())
}