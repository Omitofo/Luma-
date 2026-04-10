// Learn more about Tauri commands at https://tauri.app/develop/calling-rust/

use reqwest::blocking::Client;
use serde_json::json;
use serde_json::Value;

#[tauri::command]
fn chat(message: String) -> String {
    let client = Client::new();

    let prompt = format!(
        "You are Luma, a language tutor. Be helpful, clear and natural.\nUser: {}\nAssistant:",
        message
    );

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
            let json_result: Result<Value, _> = response.json();

            match json_result {
                Ok(data) => {
                    data["content"]
                        .as_str()
                        .unwrap_or("No response from model")
                        .to_string()
                }
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
        .invoke_handler(tauri::generate_handler![chat])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}