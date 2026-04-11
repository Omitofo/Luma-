pub fn rules(level: &str) -> String {
    match level {

        "A1" => r#"
JAPANESE A1 RULES:

- Use ONLY simple N5 grammar
- Always include:
  1. Japanese sentence
  2. Romanization (VERY IMPORTANT)
  3. Meaning in explanation language

- Keep sentences short
- Repeat key vocabulary
- Avoid kanji unless essential
- Focus on survival Japanese (greetings, basic actions)
"#.to_string(),

        "A2" => r#"
JAPANESE A2 RULES:

- Mostly simple Japanese
- Include romanization when helpful
- Begin introducing kanji slowly
- Reduce translation gradually
"#.to_string(),

        _ => r#"
JAPANESE NATURAL MODE:

- Mostly Japanese
- Romanization optional
- Minimal explanations unless needed
"#.to_string(),
    }
}