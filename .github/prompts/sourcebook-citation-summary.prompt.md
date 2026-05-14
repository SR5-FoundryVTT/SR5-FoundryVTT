---
name: "Sourcebook Citation Summary"
description: "Summarize a Shadowrun sourcebook citation such as SR5#140 or a named heading. Use for page summaries, page-range summaries, heading summaries, and heading lists grounded in the mcp_sourcebook-ci tools."
argument-hint: "Citation target, such as SR5#140, SR5 pages 139-141, or SR5 heading Social Modifiers"
agent: "agent"
---

Summarize the requested Shadowrun citation using the local `mcp_sourcebook-ci_*` tools.

Workflow:
1. Resolve the sourcebook code first.
2. Choose the narrowest citation lookup that fits the request:
   - Single page: `mcp_sourcebook-ci_lookup_citation_page`
   - Page range: `mcp_sourcebook-ci_lookup_citation_page_range`
   - Heading: `mcp_sourcebook-ci_lookup_citation_heading`
3. Use the returned excerpt as the primary evidence.
4. If the lookup result is stored in a temporary `content.json`, read that file instead of scraping raw markdown.
5. Do not use `mcp_sourcebook-ci_lookup_citation_sourcebook_text` unless the user explicitly requests full-book text.
6. Do not use `mcp_sourcebook-ci_rebuild_sourcebook_assets` unless lookup fails because indexes or markdown are missing or stale.

Return this structure:

## Citation
- Resolved sourcebook title
- Exact citation target checked

## Summary
- Concise factual summary of the cited material

## Headings
- List the headings present in the cited span
- If a label is a table heading rather than a section heading, say so

## Support Notes
- State whether the summary is directly supported by the excerpt
- Call out any ambiguity instead of guessing