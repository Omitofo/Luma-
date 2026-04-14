use reqwest::blocking::Client;
use serde::{Deserialize, Serialize};
use serde_json::json;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tauri::Emitter;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

/// Build a ChatML-formatted prompt string from messages.
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

/// Send a single non-streaming completion request to llama.cpp.
/// Emits `token_end` with the raw content string on success.
pub fn stream_completion(
    app: &tauri::AppHandle,
    prompt: String,
    max_tokens: u32,
    temperature: f32,
    cancel: Arc<AtomicBool>,
) -> Result<(), String> {
    println!("[LLM] sending request (max_tokens={}, temp={:.2})", max_tokens, temperature);

    let client = Client::builder()
        .timeout(std::time::Duration::from_secs(120)) // 2-minute hard limit
        .build()
        .map_err(|e| e.to_string())?;

    let body = json!({
        "prompt": prompt,
        "n_predict": max_tokens,
        "temperature": temperature,
        // Slightly lower top_p for more deterministic JSON structure
        "top_p": 0.90,
        "top_k": 40,
        // Stop before the end-of-turn token
        "stop": ["<|im_end|>", "<|im_start|>"],
        "stream": false,
        // Penalise repetition — helps avoid the model re-stating the prompt
        "repeat_penalty": 1.05
    });

    let res = client
        .post("http://localhost:8080/completion")
        .json(&body)
        .send()
        .map_err(|e| format!("Connection error: {}", e))?;

    // Check HTTP status before parsing body
    let status = res.status();
    if !status.is_success() {
        return Err(format!("llama.cpp returned HTTP {}", status));
    }

    let text = res.text().map_err(|e| e.to_string())?;

    if cancel.load(Ordering::SeqCst) {
        println!("[LLM] cancelled after response received — discarding");
        return Ok(());
    }

    // Parse the llama.cpp response envelope
    let json_value: serde_json::Value = serde_json::from_str(&text)
        .unwrap_or_else(|_| json!({ "content": text }));

    let final_text = json_value["content"]
        .as_str()
        .unwrap_or("")
        .trim()
        .to_string();

    if final_text.is_empty() {
        return Err("llama.cpp returned an empty response".to_string());
    }

    // ── FULL CONTENT LOG ─────────────────────────────────────────────────────
    println!("[LLM] ── raw content ({} chars) ──────────────────", final_text.len());
    println!("{}", final_text);
    println!("[LLM] ─────────────────────────────────────────────");

    let _ = app.emit("token_end", final_text);

    Ok(())
}