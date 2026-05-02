---
description: "Use when: a task mentions Shadowrun sourcebook codes like SR5, RG, SG, DT, CF, or @PDF references; resolving or validating book/page citations; summarizing cited pages or headings; reviewing code against cited rules. Prefer the mcp_sourcebook-ci citation tools before raw markdown or shell searching."
name: "Sourcebook Citation Tool Preference"
---

# Sourcebook Citation Tool Preference

- When a task includes a Shadowrun sourcebook shorthand such as `SR5`, `RG`, `SG`, `DT`, `CF`, or an `@PDF` citation, prefer the `mcp_sourcebook-ci_*` tools first.
- Start with `mcp_sourcebook-ci_resolve_sourcebook` to confirm the sourcebook and preferred markdown source.
- Then use the narrowest lookup that matches the request:
  - `mcp_sourcebook-ci_lookup_citation_page`
  - `mcp_sourcebook-ci_lookup_citation_page_range`
  - `mcp_sourcebook-ci_lookup_citation_heading`
- Use `mcp_sourcebook-ci_lookup_citation_sourcebook_text` only when the user explicitly asks for full-book text.
- If the MCP lookup returns a large temporary result file, read that file instead of scraping the markdown with shell commands.
- Treat `mcp_sourcebook-ci_rebuild_sourcebook_assets` as a repair step, not a default lookup step.
- Summaries, validations, and code reviews should be grounded in the returned excerpt, not in memory or paraphrase alone.
- If the citation result is ambiguous, say so explicitly instead of guessing.