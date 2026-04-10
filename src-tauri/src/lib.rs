use reqwest::blocking::Client;
use serde::Deserialize;
use serde_json::{json, Value};

#[derive(Deserialize)]
pub struct ChatMessage {
    role: String,
    content: String,
}

#[tauri::command]
fn chat(messages: Vec<ChatMessage>) -> String {
    let client = Client::new();

    let mut prompt = String::from(
        "You are Luma, a helpful language tutor.\n"
    );

    for msg in messages {
        match msg.role.as_str() {
            "user" => {
                prompt.push_str(&format!("User: {}\n", msg.content));
            }
            "assistant" => {
                prompt.push_str(&format!("Assistant: {}\n", msg.content));
            }
            _ => {}
        }
    }

    prompt.push_str("Assistant:");

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": 200,
            "temperature": 0.7,
            "stop": ["User:", "Assistant:"]
        }))
        .send();

    match res {
        Ok(response) => {
            match response.json::<Value>() {
                Ok(data) => data["content"]
                    .as_str()
                    .unwrap_or("No response")
                    .to_string(),
                Err(e) => format!("JSON parse error: {}", e),
            }
        }
        Err(e) => format!("Request error: {}", e),
    }
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat]) // IMPORTANT FIX
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}