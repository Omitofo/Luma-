pub fn rules(level: &str) -> String {
    match level {

"A1" => r#"
JAPANESE A1 BEHAVIOR:

- PRIORITY: simple conversation first
- Keep Japanese extremely basic (N5 only)
- DO NOT over-explain every sentence

WHEN TEACHING:
- Include:
  - Japanese
  - romanization
  - translation (ONLY if needed for clarity)

WHEN NOT TEACHING:
- You can just respond naturally in simple Japanese + minimal English
- Keep flow conversational, not instructional

IMPORTANT:
- Slow down communication
- Repeat key phrases often
- Do not overload the learner with information
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