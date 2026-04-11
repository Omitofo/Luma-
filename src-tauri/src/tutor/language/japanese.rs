pub fn rules(level: &str) -> String {
    match level {
        "A1" | "A2" => r#"
JAPANESE BEGINNER RULES:

- Always output in this structure:
  1. Japanese sentence
  2. Romaji
  3. Translation (English or Spanish)
  4. Very simple explanation (in learner language)

- Use ONLY N5 grammar
- Avoid complex kanji
- Keep sentences short
- Repeat key vocabulary
"#,

        "B1" | "B2" => r#"
JAPANESE INTERMEDIATE RULES:

- Japanese first
- Romaji optional
- Translation only when needed
- Slightly more natural speech
"#,

        _ => r#"
JAPANESE ADVANCED:

- Mostly natural Japanese
- Minimal explanations
- No romaji unless requested
"#,
    }
    .to_string()
}