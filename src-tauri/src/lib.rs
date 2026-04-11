use reqwest::blocking::Client;
use serde::Deserialize;
use serde_json::json;
use std::io::{BufRead, BufReader};
use tauri::Emitter;

mod tutor;
mod memory;

use tutor::prompt::build_system_prompt;

#[derive(Deserialize, Clone)]
pub struct ChatMessage {
    pub role: String,
    pub content: String,
}

#[derive(Deserialize, Clone)]
pub struct LearnerProfile {
    pub language: String,
    pub level: String,
    pub focus: Option<String>,
    pub explanation_language: String,
}

#[tauri::command]
fn chat(
    app: tauri::AppHandle,
    messages: Vec<ChatMessage>,
    tutor_mode: String,
    learner_profile: LearnerProfile,
) {
    let client = Client::new();

    // TEMP MEMORY (Phase 2.3 later will replace this)
    let memory_items = vec![
        "prefers short explanations".to_string(),
        "beginner learner".to_string(),
    ];

    let memory = memory::format_memory(memory_items);

    let system_prompt = build_system_prompt(
        &tutor_mode,
        &learner_profile,
        &memory,
    );

    let mut prompt = format!(
        "<|im_start|>system\n{}<|im_end|>\n",
        system_prompt
    );

    for msg in messages {
let role = match msg.role.as_str() {
    "user" => "user",
    _ => "assistant",
};
        prompt.push_str(&format!(
            "<|im_start|>{}\n{}<|im_end|>\n",
            role,
            msg.content
        ));
    }

    prompt.push_str("<|im_start|>assistant\n");

    let res = client
        .post("http://localhost:8080/completion")
        .json(&json!({
            "prompt": prompt,
            "n_predict": 300,
            "temperature": 0.4,
            "stop": ["<|im_end|>"],
            "stream": true
        }))
        .send();

    match res {
        Ok(response) => {
            let reader = BufReader::new(response);
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
        .expect("error while running app");
}