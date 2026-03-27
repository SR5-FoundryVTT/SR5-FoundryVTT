---
name: sourcebook-citation-resolution
description: "Use when: resolving Shadowrun sourcebook shorthand like SR5, RG, SG, DT, CF, or @PDF references; locating cited pages, page ranges, headings, table-of-contents entries, or full-book excerpts with the mcp_sourcebook-ci tools; validating citations against returned excerpts without direct file access."
argument-hint: "Citation target, such as SR5#140, SR5 pages 139-141, or SR5 heading Social Modifiers"
---

# Sourcebook Citation Resolution

## Purpose

Use this skill when a task depends on turning a sourcebook code, page reference, page range, heading, or table-of-contents request into the authoritative excerpt returned by the `mcp_sourcebook-ci_*` MCP tools.

Assume the sourcebook service may be running in an isolated container. Do not rely on direct access to markdown files, generated indexes, temporary result files, or any other filesystem paths behind the MCP server.

Primary examples:
- Resolve `SR5#159` or `@PDF RG#124` to the right book and page text.
- Resolve `SR5 pages 139-141` to a continuous excerpt.
- Resolve a heading such as `SR5 Social Modifiers` to the best matching section.
- Resolve a table of contents request such as `SR5 contents` to indexed TOC pages and parsed section entries.
- Verify that a code comment or rule citation points to the expected sourcebook section.
- Summarize a cited rule while listing the headings found in the cited span.

## When To Use

- A prompt includes a sourcebook shorthand code such as `SR5`, `RG`, `SG`, `DT`, or `CF`.
- A prompt references `@PDF`, `book#page`, a page range, or a named heading.
- A prompt asks for a sourcebook table of contents or an entire indexed sourcebook excerpt.
- The user wants the exact cited text, a validation check, or a concise summary grounded in the sourcebook.
- The task depends on the `mcp_sourcebook-ci_*` tools rather than guesswork from repo comments or direct file access.

## Preferred Tools

Prefer the installed `mcp-sourcebook-citation` MCP server before any other approach.

Use these MCP tools by request shape:
1. `activate_sourcebook_lookup_tools` if the lookup tool category is not already active.
2. `mcp_sourcebook-ci_resolve_sourcebook` to confirm the shorthand code and resolved sourcebook metadata.
3. `mcp_sourcebook-ci_lookup_citation_page` for a single page such as `SR5#140`.
4. `mcp_sourcebook-ci_lookup_citation_page_range` for a continuous range such as `SR5 pages 139-141`.
5. `mcp_sourcebook-ci_lookup_citation_heading` for a heading or section title inside a sourcebook.
6. `mcp_sourcebook-ci_lookup_citation_table_of_contents` for TOC pages and parsed section lists.
7. `mcp_sourcebook-ci_lookup_citation_sourcebook_text` only when the user explicitly asks for full-book text.

The MCP responses provide the authoritative metadata and excerpt text needed for citation checks. Prefer those results over ad-hoc inference.

Do not fall back to reading `mcp-sourcebook-citation` repository paths, generated indexes, markdown files, or temporary result files. If the MCP response is insufficient, run a narrower looku instead of trying to access the server filesystem.

## Procedure

1. Parse the request into one of these forms:
	- `code + page`
	- `code + page range`
	- `code + heading`
	- `code + table of contents`
	- `code + full book`
2. Activate lookup tools if needed with `activate_sourcebook_lookup_tools`.
3. Resolve the sourcebook with `mcp_sourcebook-ci_resolve_sourcebook`.
3. Run the narrowest lookup tool that fits the request:
	- Single page: `mcp_sourcebook-ci_lookup_citation_page`
	- Page range: `mcp_sourcebook-ci_lookup_citation_page_range`
	- Heading: `mcp_sourcebook-ci_lookup_citation_heading`
	- Table of contents: `mcp_sourcebook-ci_lookup_citation_table_of_contents`
	- Full book: `mcp_sourcebook-ci_lookup_citation_sourcebook_text`
4. If a heading lookup appears ambiguous, especially if it matches table-of-contents or front-matter text, prefer a page or page-range lookup to verify the actual rules text.
5. Use the returned excerpt or metadata as the primary evidence for the answer.
6. Summarize only what is supported by the returned MCP content. Distinguish direct support from inference.
7. When the user asks for headings, list the headings or TOC entries present in the returned result and say when a match is ambiguous.
8. If the response is incomplete, refine the lookup with a narrower page range, a more specific heading, or an explicit query string. Do not switch to direct filesystem access.

## Reporting Guidance

When possible, distinguish between these outcomes:
- Code resolves and page exists.
- Code resolves and heading exists.
- Code resolves and page range exists.
- Code resolves and table of contents exists.
- Code resolves but page cannot be indexed.
- Code resolves but heading cannot be matched confidently.
- Code resolves but the heading match is likely a TOC or front-matter collision.
- Page exists but the nearby text does not support the cited claim.
- The comment is intentionally contextual rather than a direct citation.

## Output Checklist

- Include the resolved sourcebook title when useful.
- State the exact citation target that was checked.
- Quote or summarize only the returned excerpt.
- If asked for a summary, keep it concise and factual.
- If asked for headings, list them separately from the prose summary.
- If the tool response is ambiguous, say so explicitly instead of guessing.