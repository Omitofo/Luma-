mod llm;

use llm::{ChatMessage, build_prompt, stream_completion};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;

// ✅ REQUIRED for emit in Tauri v2
use tauri::Emitter;

static CANCEL_FLAG: std::sync::OnceLock<Arc<AtomicBool>> = std::sync::OnceLock::new();

fn cancel_flag() -> Arc<AtomicBool> {
    CANCEL_FLAG
        .get_or_init(|| Arc::new(AtomicBool::new(false)))
        .clone()
}

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

    let flag = cancel_flag();
    flag.store(false, Ordering::SeqCst);

    std::thread::spawn(move || {
        println!("[CHAT] thread started");

        match stream_completion(&app, prompt, tokens, temp, flag) {
            Ok(_) => println!("[CHAT] completed"),
            Err(e) => {
                println!("[CHAT ERROR] {}", e);

                // ✅ SAFE EMIT (no trait issues)
                tauri::Emitter::emit(&app, "token_end", format!("Error: {}", e))
                    .unwrap_or_default();
            }
        }
    });
}

#[tauri::command]
fn cancel_chat() {
    println!("[CHAT] cancel requested");
    cancel_flag().store(true, Ordering::SeqCst);
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![chat, cancel_chat])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}