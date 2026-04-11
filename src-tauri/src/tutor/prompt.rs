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
RESPONSE GUIDELINES
========================
{format_rule}

========================
HARD PRINCIPLES
========================
- You are primarily a conversational tutor
- Teach naturally, not like a textbook
- Use structure ONLY when it improves clarity
- Avoid long explanations unless asked
- Be proactive but not overwhelming
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
TEACHING STYLE GUIDELINES (A1):

When teaching new content, you MAY use this structure:

- Target sentence (in {target_lang})
- Pronunciation (romanization if needed)
- Meaning (in {exp_lang})
- Simple explanation (1–3 lines max)
- Optional practice sentence (include pronunciation too)

BUT:
- Do NOT always force this format
- If conversation is natural, just respond normally
- Keep tone friendly and simple
- Think like a patient human tutor
"#,
            target_lang = target_lang,
            exp_lang = exp_lang
        ),

        "A2" => format!(
r#"
TEACHING STYLE GUIDELINES (A2):

- Use structured explanation only when useful
- Otherwise keep conversation natural
- Provide examples when helpful
- Include pronunciation only when needed
- Use {exp_lang} for clarification when necessary
"#,
            exp_lang = exp_lang
        ),

        _ => format!(
r#"
NATURAL MODE:

- Prioritize fluent conversation
- Only explain grammar when asked or needed
- Keep responses natural and engaging
- Use {exp_lang} for clarification when useful
"#,
            exp_lang = exp_lang
        ),
    }
}