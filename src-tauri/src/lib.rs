use reqwest::blocking::Client;
use serde::Deserialize;
use serde_json::json;

#[derive(Deserialize)]
pub struct ChatMessage {
    role: String,
    content: String,
}

#[tauri::command]
fn chat(messages: Vec<ChatMessage>) -> String {
    let client = Client::new();

let mut prompt = String::from("<|im_start|>system\nYou are Luma, a helpful language tutor.<|im_end|>\n");
  
   for msg in messages {
    if msg.role == "user" {
        prompt.push_str(&format!(
            "<|im_start|>user\n{}<|im_end|>\n",
            msg.content
        ));
    } else {
        prompt.push_str(&format!(
            "<|im_start|>assistant\n{}<|im_end|>\n",
            msg.content
        ));
    }
}

prompt.push_str("<|im_start|>assistant\n");

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": 200,
            "temperature": 0.7,
            "stop": ["<|im_end|>"]

        }))
        .send();

    match res {
        Ok(response) => {
            let text = response.text().unwrap_or_default();

            let json: serde_json::Value =
                serde_json::from_str(&text).unwrap_or_default();

            json["content"]
                .as_str()
                .unwrap_or("No response from model")
                .to_string()
        }
        Err(e) => {
            format!("Request error: {}", e)
        }
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