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

/// 🚨 NEW: no streaming, just full response
pub fn stream_completion(
    app: &tauri::AppHandle,
    prompt: String,
    max_tokens: u32,
    temperature: f32,
    cancel: Arc<AtomicBool>,
) -> Result<(), String> {
    println!("[LLM] sending request...");

    let client = Client::new();

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": max_tokens,
            "temperature": temperature,
            "stop": ["<|im_end|>"],
            "stream": false   // ✅ IMPORTANT CHANGE
        }))
        .send()
        .map_err(|e| format!("Connection error: {}", e))?;

    let text = res.text().map_err(|e| e.to_string())?;

    println!("[LLM RAW RESPONSE]\n{}", text);

    if cancel.load(Ordering::SeqCst) {
        return Ok(());
    }

    // llama.cpp usually returns full text in:
    let json_value: serde_json::Value =
        serde_json::from_str(&text).unwrap_or(json!({ "content": text }));

    let final_text = json_value["content"]
        .as_str()
        .unwrap_or(&text)
        .to_string();

    println!("[LLM FINAL TEXT]\n{}", final_text);

    // 🚨 emit ONLY once
    let _ = app.emit("token_end", final_text);

    Ok(())
}