use crate::LearnerProfile;
use crate::tutor::{academic, casual, language};

pub fn build_system_prompt(
    mode: &str,
    profile: &LearnerProfile,
    memory: &str,
) -> String {

    let base = match mode {
        "academic" => academic::prompt(),
        _ => casual::prompt(),
    };

    let language_rules =
        language::get_language_rules(&profile.language, &profile.level);

    let focus = profile
        .focus
        .clone()
        .unwrap_or("general conversation".to_string());

    let format_rule = format_rule(
        &profile.level,
        &profile.explanation_language,
        &profile.language
    );

    format!(
"{base}

========================
LANGUAGE RULES
========================
{language_rules}

========================
LEARNER PROFILE
========================
Language: {lang}
Level: {level}
Focus: {focus}
Explanation language: {exp_lang}

========================
MEMORY
========================
{memory}

========================
RESPONSE FORMAT (STRICT)
========================
{format_rule}

========================
HARD RULES
========================
- ALWAYS follow structure exactly
- NEVER produce long paragraphs at A1/A2
- ALWAYS include translation at beginner levels
- ALWAYS include pronunciation for non-Latin scripts
- Explanation MUST use explanation_language
- Be proactive (teach without waiting)
",
        base = base,
        language_rules = language_rules,
        focus = focus,
        memory = memory,
        lang = profile.language,
        level = profile.level,
        exp_lang = profile.explanation_language
    )
}

fn format_rule(level: &str, exp_lang: &str, target_lang: &str) -> String {
    match level {

        "A1" => format!(
r#"
OUTPUT STRUCTURE (BEGINNER MODE):

1. TARGET SENTENCE ({target_lang})
2. PRONUNCIATION (romanization if needed)
3. TRANSLATION ({exp_lang})
4. SIMPLE EXPLANATION ({exp_lang})
   - max 2–3 bullet points
   - extremely simple words
5. PRACTICE LINE
   - 1 short repetition exercise

RULES:
- NO long paragraphs
- ONE idea per line
- Keep everything extremely simple
"#,
            target_lang = target_lang,
            exp_lang = exp_lang
        ),

        "A2" => format!(
r#"
OUTPUT STRUCTURE:

1. TARGET SENTENCE
2. TRANSLATION ({exp_lang})
3. SHORT EXPLANATION (max 3 bullets, {exp_lang})
4. 2 EXAMPLES
5. 1 PRACTICE LINE
"#,
            exp_lang = exp_lang
        ),

        _ => format!(
r#"
Free conversation mode.

- Natural dialogue
- Light corrections only
- Explanation in {exp_lang} when needed
"#,
            exp_lang = exp_lang
        ),
    }
}