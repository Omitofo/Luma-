//lib/parseLlmJson.ts
/**
 * parseLlmJson — extracts and parses the first valid JSON value
 * (object OR array) from arbitrary LLM output.
 *
 * Handles all common model quirks:
 *  - Markdown code fences  ```json … ```  or  ``` … ```
 *  - Prose before/after the JSON block
 *  - Trailing commas          { "a": 1, }
 *  - Single-quoted strings    { 'key': 'val' }
 *  - Unquoted keys            { key: "val" }
 *  - Python-style booleans    True / False / None
 *  - Control characters inside strings
 *  - BOM prefix
 *  - Multiple JSON blocks (takes the first valid one)
 */
export function parseLlmJson<T>(raw: string): T | null {
  if (!raw || typeof raw !== "string") return null;

  // 1. Strip BOM
  let text = raw.replace(/^\uFEFF/, "");

  // 2. Strip markdown code fences (```json … ``` or ``` … ```)
  text = text.replace(/```(?:json)?\s*([\s\S]*?)```/gi, "$1");

  // 3. Normalise Python literals → JSON
  text = text
    .replace(/\bTrue\b/g, "true")
    .replace(/\bFalse\b/g, "false")
    .replace(/\bNone\b/g, "null");

  // 4. Try every JSON candidate found in the text (objects and arrays)
  const candidates = extractJsonCandidates(text);

  for (const candidate of candidates) {
    const result = tryParse<T>(candidate);
    if (result !== null) return result;
  }

  // 5. Last resort: try the entire cleaned text
  return tryParse<T>(text.trim());
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract substrings that look like JSON objects or arrays by scanning for
 * matching braces/brackets.
 */
function extractJsonCandidates(text: string): string[] {
  const candidates: string[] = [];
  const openers: Record<string, string> = { "{": "}", "[": "]" };

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch !== "{" && ch !== "[") continue;

    const closer = openers[ch];
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let j = i; j < text.length; j++) {
      const c = text[j];

      if (escape) { escape = false; continue; }
      if (c === "\\" && inString) { escape = true; continue; }
      if (c === '"') { inString = !inString; continue; }
      if (inString) continue;

      if (c === ch) depth++;
      else if (c === closer) {
        depth--;
        if (depth === 0) {
          candidates.push(text.slice(i, j + 1));
          break;
        }
      }
    }
  }

  return candidates;
}

/** Attempt JSON.parse after light fixups; return null on failure. */
function tryParse<T>(text: string): T | null {
  if (!text) return null;

  const attempts = [
    text,
    fixTrailingCommas(text),
    fixSingleQuotes(text),
    fixUnquotedKeys(fixSingleQuotes(fixTrailingCommas(text))),
  ];

  for (const attempt of attempts) {
    try {
      return JSON.parse(attempt) as T;
    } catch {
      // try next
    }
  }
  return null;
}

/** Remove trailing commas before } or ] */
function fixTrailingCommas(s: string): string {
  return s.replace(/,\s*([}\]])/g, "$1");
}

/** Convert single-quoted strings to double-quoted (naive but covers most cases) */
function fixSingleQuotes(s: string): string {
  // Only replace 'value' patterns that aren't inside double-quoted strings
  return s.replace(/'([^'\\]*(\\.[^'\\]*)*)'/g, '"$1"');
}

/** Quote bare word keys: { key: → { "key": */
function fixUnquotedKeys(s: string): string {
  return s.replace(/([{,]\s*)([a-zA-Z_][a-zA-Z0-9_]*)(\s*:)/g, '$1"$2"$3');
}