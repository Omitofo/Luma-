use reqwest::blocking::Client;
use serde::Deserialize;
use serde_json::json;
use std::io::{BufRead, BufReader};
use tauri::Emitter;

mod tutor;

#[derive(Deserialize)]
pub struct ChatMessage {
    role: String,
    content: String,
}

#[derive(Deserialize)]
pub struct LearnerProfile {
    language: String,
    level: String,
}

#[tauri::command]
fn chat(
    app: tauri::AppHandle,
    messages: Vec<ChatMessage>,
    tutor_mode: String,
    learner_profile: LearnerProfile, // ✅ ADD THIS
) {
    let client = Client::new();

    // 👇 ENHANCED SYSTEM PROMPT (minimal injection, no architecture break)
    let base_prompt = tutor::get_prompt(&tutor_mode);

    let system_prompt = format!(
        "{}\nLanguage: {}\nLevel: {}",
        base_prompt,
        learner_profile.language,
        learner_profile.level
    );

    let mut prompt = format!(
        "<|im_start|>system\n{}<|im_end|>\n",
        system_prompt
    );

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
            "stop": ["<|im_end|>"],
            "stream": true
        }))
        .send();

    match res {
        Ok(response) => {
            let reader = BufReader::new(response);
            let mut full_response = String::new();

            for line in reader.lines().flatten() {
                if !line.starts_with("data: ") {
                    continue;
                }

                let json_part = line.trim_start_matches("data: ").trim();

                if json_part == "[DONE]" {
                    break;
                }

                if let Ok(data) =
                    serde_json::from_str::<serde_json::Value>(json_part)
                {
                    if let Some(token) = data["content"].as_str() {
                        full_response.push_str(token);
                        let _ = app.emit("token", token);
                    }
                }
            }

            let _ = app.emit("token_end", full_response);
        }

        Err(e) => {
            let _ = app.emit("token_end", format!("Error: {}", e));
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