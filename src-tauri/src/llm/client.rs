use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::io::{BufRead, BufReader};
use tauri::Emitter;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Builds an OpenAI-chat-style prompt string for llama.cpp using ChatML format.
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

/// Calls llama.cpp's /completion endpoint with streaming SSE.
/// Emits "token" events for each chunk and "token_end" with the full response.
pub fn stream_completion(
    app: &tauri::AppHandle,
    prompt: String,
    max_tokens: u32,
    temperature: f32,
) -> Result<(), String> {
    let client = Client::new();

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": max_tokens,
            "temperature": temperature,
            "stop": ["<|im_end|>"],
            "stream": true
        }))
        .send()
        .map_err(|e| format!("Connection error: {}", e))?;

    let reader = BufReader::new(res);
    let mut full = String::new();

    for line in reader.lines().flatten() {
        if !line.starts_with("data: ") {
            continue;
        }

        let json_part = line.trim_start_matches("data: ").trim();

        if json_part == "[DONE]" {
            break;
        }

        if let Ok(data) = serde_json::from_str::<serde_json::Value>(json_part) {
            if let Some(token) = data["content"].as_str() {
                full.push_str(token);
                let _ = app.emit("token", token);
            }
        }
    }

    let _ = app.emit("token_end", full);
    Ok(())
}