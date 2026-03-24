---
name: sourcebook-citation-resolution
description: "Use when: resolving Shadowrun sourcebook shorthand like SR5, RG, SG, DT, CF, or @PDF references; locating cited pages, page ranges, or headings in the local markdown corpus; validating book/page citations against converted source text; summarizing cited sections with the mcp_sourcebook-ci tools."
argument-hint: "Citation target, such as SR5#140, SR5 pages 139-141, or SR5 heading Social Modifiers"
---

# Sourcebook Citation Resolution

## Purpose

Use this skill when a task depends on turning a sourcebook code, page reference, page range, or heading into the authoritative local markdown text managed by the `mcp-sourcebook-citation` toolchain.

Primary examples:
- Resolve `SR5#159` or `@PDF RG#124` to the right book and page text.
- Resolve `SR5 pages 139-141` to a continuous excerpt.
- Resolve a heading such as `SR5 Social Modifiers` to the best matching section.
- Verify that a code comment or rule citation points to the expected sourcebook section.
- Summarize a cited rule while listing the headings found in the cited span.

## When To Use

- A prompt includes a sourcebook shorthand code such as `SR5`, `RG`, `SG`, `DT`, or `CF`.
- A prompt references `@PDF`, `book#page`, a page range, or a named heading.
- The user wants the exact cited text, a validation check, or a concise summary grounded in the sourcebook.
- The task depends on the local `mcp_sourcebook-ci_*` tools rather than guesswork from repo comments.

## Preferred Tools

Prefer the installed `mcp-sourcebook-citation` MCP server before searching raw files.

Use these MCP tools by request shape:
1. `mcp_sourcebook-ci_resolve_sourcebook` to confirm the shorthand code, title, and preferred markdown/PDF source.
2. `mcp_sourcebook-ci_lookup_citation_page` for a single page such as `SR5#140`.
3. `mcp_sourcebook-ci_lookup_citation_page_range` for a continuous range such as `SR5 pages 139-141`.
4. `mcp_sourcebook-ci_lookup_citation_heading` for a heading or section title inside a sourcebook.
5. `mcp_sourcebook-ci_lookup_citation_sourcebook_text` only when the user explicitly asks for full-book text.
6. `mcp_sourcebook-ci_rebuild_sourcebook_assets` only when indexes or generated markdown are missing, stale, or known-bad.

The MCP responses already include the resolved file, page span, heading span, and excerpt text needed for most citation checks. Prefer those excerpts over ad-hoc raw-file reads.

If MCP is unavailable, use the standalone project's generated indexes in this order:
1. `mcp-sourcebook-citation/data/indexes/book-index.json`
2. `mcp-sourcebook-citation/data/indexes/page-index.json`
3. Read the exact lines from the resolved markdown file and compare the surrounding text to the requested rule or comment.

## Procedure

1. Parse the request into one of these forms:
	- `code + page`
	- `code + page range`
	- `code + heading`
	- `code + full book`
2. Resolve the sourcebook with `mcp_sourcebook-ci_resolve_sourcebook`.
3. Run the narrowest lookup tool that fits the request:
	- Single page: `mcp_sourcebook-ci_lookup_citation_page`
	- Page range: `mcp_sourcebook-ci_lookup_citation_page_range`
	- Heading: `mcp_sourcebook-ci_lookup_citation_heading`
	- Full book: `mcp_sourcebook-ci_lookup_citation_sourcebook_text`
4. If the tool returns a large result stored in a temporary `content.json` file, read that file instead of switching to shell-based scraping.
5. Use the returned excerpt as the primary evidence for the answer.
6. Summarize only what is supported by the excerpt. Distinguish direct support from inference.
7. When the user asks for headings, list the headings present in the returned span and say when a heading was inferred from table labels versus section titles.

## Rebuild Workflow

Use `mcp_sourcebook-ci_rebuild_sourcebook_assets` only when the citation data is unavailable or clearly stale.

Recommended order:
1. Try the lookup tools first.
2. If resolution or lookup fails because the index is missing or the markdown source is absent, run `mcp_sourcebook-ci_rebuild_sourcebook_assets` with `dryRun: true` to inspect what would be rebuilt.
3. If rebuilding is appropriate, rerun without `dryRun`.
4. Re-run the citation lookup after the rebuild completes.

Do not rebuild sourcebook assets just to answer a normal citation question when the lookup tools already succeed.

## Fallbacks

If the generated indexes are missing, stale, or incomplete:
- Read `mcp-sourcebook-citation/data/catalog/books.xml` for the canonical Chummer catalog.
- Prefer markdown files in `mcp-sourcebook-citation/data/sourcebooks/md/` when present.
- Fall back to filename matching only when no generated index entry exists.

## Validation Workflow

When validating a citation:
1. Confirm the shorthand code resolves.
2. Confirm a preferred markdown file exists.
3. Confirm the cited page, page range, or heading resolves.
4. Read the excerpt returned by the MCP lookup.
5. Report whether the citation is exact, broadly correct, weakly supported, or unsupported.

## Reporting Guidance

When possible, distinguish between these outcomes:
- Code resolves and page exists.
- Code resolves and heading exists.
- Code resolves and page range exists.
- Code resolves but page cannot be indexed.
- Code resolves but heading cannot be matched confidently.
- Page exists but the nearby text does not support the cited claim.
- The comment is intentionally contextual rather than a direct citation.

## Output Checklist

- Include the resolved sourcebook title when useful.
- State the exact citation target that was checked.
- Quote or summarize only the returned excerpt.
- If asked for a summary, keep it concise and factual.
- If asked for headings, list them separately from the prose summary.
- If the tool response is ambiguous, say so explicitly instead of guessing.