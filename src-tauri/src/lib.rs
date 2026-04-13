mod llm;

use tauri::Emitter;
use llm::{ChatMessage, build_prompt, stream_completion};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

/// Shared cancellation flag — set to true when the frontend requests a stop.
/// A new call to `chat` always resets it to false first.
static CANCEL_FLAG: std::sync::OnceLock<Arc<AtomicBool>> = std::sync::OnceLock::new();

fn cancel_flag() -> Arc<AtomicBool> {
    CANCEL_FLAG
        .get_or_init(|| Arc::new(AtomicBool::new(false)))
        .clone()
}

/// Start a streaming completion.
/// Resets the cancel flag, then spawns a background thread so the Tauri
/// event loop is never blocked.
#[tauri::command]
fn chat(
    app: tauri::AppHandle,
    messages: Vec<ChatMessage>,
    max_tokens: Option<u32>,
    temperature: Option<f32>,
) {
    let tokens = max_tokens.unwrap_or(512).min(2048);
    let temp = temperature.unwrap_or(0.4_f32).clamp(0.0, 2.0);
    let prompt = build_prompt(&messages);

    // Reset cancel flag for this new request
    let flag = cancel_flag();
    flag.store(false, Ordering::SeqCst);

    std::thread::spawn(move || {
        if let Err(e) = stream_completion(&app, prompt, tokens, temp, flag) {
            let _ = app.emit("token_end", format!("Error: {}", e));
        }
    });
}

/// Ask the streaming thread to stop after the current token.
/// The frontend calls this on unmount / game exit.
#[tauri::command]
fn cancel_chat() {
    cancel_flag().store(true, Ordering::SeqCst);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat, cancel_chat])
        .run(tauri::generate_context!())
        .expect("error while running Tauri application");
}