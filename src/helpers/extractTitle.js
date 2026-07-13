// Extract a usable note title from an LLM response.
//
// The old logic (raw.trim(), strip surrounding quotes, then require length < 100)
// discarded the entire response whenever a model didn't obey "return ONLY the
// title". Self-hosted / local models routinely add a prefix ("Title:", "Here is
// a concise title:"), wrap the title in markdown, or emit extra lines — so the
// generated title was silently dropped and the note name never updated, even
// though cleanup/formatting worked. This normalizes those shapes and truncates
// (instead of discarding) an over-long title.
const MAX_TITLE_LEN = 80;

export function extractTitle(raw) {
  if (typeof raw !== "string") return "";

  // Take the first non-empty line — models often put the title first and any
  // explanation on following lines.
  const firstLine =
    raw
      .split(/\r?\n/)
      .map((l) => l.trim())
      .find((l) => l.length > 0) ?? "";

  let s = firstLine
    // leading markdown heading / bullet markers
    .replace(/^#+\s*/, "")
    .replace(/^[-*]\s*/, "")
    // common lead-ins: "Title:", "Note title -", "Here is a concise title:", etc.
    .replace(
      /^(?:the\s+)?(?:note\s+|suggested\s+)?title\s*[:\-–—]\s*/i,
      ""
    )
    .replace(/^here(?:'s| is)(?:\s+a)?(?:\s+concise)?(?:\s+note)?\s+title\s*[:\-–—]?\s*/i, "")
    .trim()
    // surrounding quotes / markdown emphasis
    .replace(/^["'`*_]+/, "")
    .replace(/["'`*_]+$/, "")
    .trim();

  if (s.length === 0) return "";

  // Truncate an over-long title at a word boundary rather than throwing it away.
  if (s.length > MAX_TITLE_LEN) {
    s = s.slice(0, MAX_TITLE_LEN).replace(/\s+\S*$/, "").trim();
  }

  return s;
}
