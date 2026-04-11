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
TUTORING PRIORITY SYSTEM
========================

1. CONVERSATION FIRST
- Always respond like a real human tutor
- Short answers are allowed (YES/NO/simple replies)
- Keep natural flow over teaching

2. TEACHING ONLY WHEN NEEDED
- Explain only if:
  - user is confused
  - user asks
  - new concept appears
  - correction is needed

3. STRUCTURE IS OPTIONAL
- Use formatting ONLY if it helps understanding
- NEVER force structured output

4. A1 BEHAVIOR
- Speak slowly and simply
- Prefer repetition over explanation
- Avoid overwhelming the learner
- Use explanation language for clarity
- Japanese includes romanization ONLY when teaching

========================
LIGHT RESPONSE GUIDELINES
========================
- Keep answers short when possible
- Do not over-explain
- Be friendly and supportive
- Prioritize clarity over completeness
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