---
name: sourcebook-citation-implementation-review
description: "Use when: comparing a repo comment, rules implementation, or behavior claim against Shadowrun sourcebook citations like SR5#140, page ranges, or headings; checking whether code matches cited rules; reviewing rule-backed changes with the mcp_sourcebook-ci tools."
argument-hint: "Code location or behavior claim plus one or more citations, such as compare src/module/... against SR5#169"
---

# Sourcebook Citation Implementation Review

## Purpose

Use this skill when a task requires comparing repository code, comments, or claimed game behavior against one or more Shadowrun sourcebook citations.

Primary examples:
- Check whether a rules implementation matches `SR5#169`.
- Verify whether a code comment cites the right page.
- Review a change request that claims to implement a rule from `SR5 pages 139-141`.
- Compare a behavioral summary in chat against a heading-based citation lookup.

## When To Use

- The task asks whether code matches a cited rule.
- The task asks for a review of a sourcebook-backed implementation.
- The task asks whether a repo comment, test, or rules flow is supported by a specific citation.
- The task needs both code reading and sourcebook citation lookup.

## Inputs To Gather

1. The code location, comment, test, or behavior claim to inspect.
2. The citation target or targets.
3. Whether the user wants validation, review findings, or an implementation suggestion.

## Preferred Workflow

1. Read the relevant code, comment, or test in the workspace.
2. Parse each citation target into the narrowest lookup form:
   - `code + page`
   - `code + page range`
   - `code + heading`
3. Resolve the sourcebook with `mcp_sourcebook-ci_resolve_sourcebook`.
4. Retrieve the citation text with the narrowest available lookup tool.
5. Compare the implementation or claim against the excerpt.
6. Separate these outcomes clearly:
   - matches citation
   - partially matches citation
   - contradicts citation
   - citation is too weak or ambiguous to decide
7. If the user asked for a review, prioritize concrete findings first, with file locations and the specific rule mismatch.
8. If the user asked for a fix, propose or implement only the behavior that is actually supported by the cited text.

## Review Checklist

- Does the cited page or heading resolve cleanly?
- Does the cited excerpt actually describe the claimed rule?
- Does the code implement the same trigger, scope, modifiers, and exceptions?
- Are there hidden assumptions in the implementation that the citation does not support?
- Are comments or tests overstating what the citation says?

## Reporting Guidance

When reviewing, structure the result in this order:
1. Findings, ordered by severity.
2. Open questions or ambiguities in the citation.
3. Brief change summary or recommendation.

When validating a single claim, report:
1. Citation target checked.
2. Relevant excerpt summary.
3. Match level: exact, partial, weak, or unsupported.
4. Reason for that judgment.

## Tool Guidance

- Prefer `mcp_sourcebook-ci_lookup_citation_page`, `mcp_sourcebook-ci_lookup_citation_page_range`, and `mcp_sourcebook-ci_lookup_citation_heading` over raw markdown searching.
- Use raw file reads in the repo for code under review.
- Use `mcp_sourcebook-ci_rebuild_sourcebook_assets` only if citation resolution fails because sourcebook assets are missing or stale.
- Do not cite rules more strongly than the excerpt supports.