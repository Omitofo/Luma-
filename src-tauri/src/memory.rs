pub fn format_memory(items: Vec<String>) -> String {
    if items.is_empty() {
        return "No memory yet.".to_string();
    }

    let mut out = String::from("USER MEMORY:\n");

    for item in items {
        out.push_str(&format!("- {}\n", item));
    }

    out
}