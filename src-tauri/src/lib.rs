mod llm;

use llm::{ChatMessage, build_prompt, stream_completion};

/// Core Tauri command: accepts a messages array (system/user/assistant),
/// builds the ChatML prompt, and streams tokens back via Tauri events.
#[tauri::command]
fn chat(
    app: tauri::AppHandle,
    messages: Vec<ChatMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
) {
    let tokens = max_tokens.unwrap_or(512).min(2048);
    let temp = temperature.unwrap_or(0.4).clamp(0.0, 2.0);

    let prompt = build_prompt(&messages);

    // Run in a spawned thread to avoid blocking the Tauri event loop
    std::thread::spawn(move || {
        if let Err(e) = stream_completion(&app, prompt, tokens, temp) {
            let _ = app.emit("token_end", format!("Error: {}", e));
        }
    });
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}