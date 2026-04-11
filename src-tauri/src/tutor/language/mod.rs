pub mod japanese;

pub fn get_language_rules(lang: &str, level: &str) -> String {
    match lang {
        "japanese" => japanese::rules(level),
        _ => default_rules(level),
    }
}

fn default_rules(_level: &str) -> String {
    r#"
- Keep explanations simple
- Adapt to learner level
- Prefer clarity over complexity
"#.to_string()
}