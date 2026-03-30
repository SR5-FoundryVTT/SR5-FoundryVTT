---
description: "Use when debugging SR5e UI bugs, fixing sheet rendering issues, investigating actor/item display problems, or verifying visual changes in the running Foundry world. Attaches the live Foundry browser session at http://localhost:30000 for inspection and verification."
---

# Foundry UI Debugging

A live Foundry session is available at `http://localhost:30000`. Use it to inspect and verify all UI changes.

## Session Setup

Before inspecting, confirm the session is active. If the URL is `/join`, log in first:

```js
await page.selectOption('select[name="userid"]', { label: 'Gamemaster' });
await page.click('button[name="join"]');
await page.waitForLoadState('networkidle');
```

## Workflow for UI Bugs

1. **Reproduce** — navigate to the relevant sheet or panel in the browser session and take a screenshot to document the broken state
2. **Fix** — edit the Handlebars template (`src/templates/`) or SCSS (`src/css/`) in the source
3. **Rebuild** — the `gulp: watch` task rebuilds automatically on file save; wait for it to finish
4. **Reload** — navigate the browser to `/join` and log back in to reload the bundle
5. **Verify** — open the affected sheet/panel and take a screenshot to confirm the fix

## Useful Console Inspection

Run these via `run_playwright_code` with `page.evaluate(...)`:

```js
// Inspect a specific actor's system data
game.actors.getName('<ActorName>').system

// Find an open sheet application
Object.values(ui.windows).find(w => w.constructor.name === 'SR5CharacterSheet')

// Check rendered HTML of an open app
Object.values(ui.windows)[0].element.innerHTML
```

## Key Selectors

| Element | Selector |
|---------|---------|
| Actor sheet window | `.app.sheet.actor` |
| Item sheet window | `.app.sheet.item` |
| Dialog windows | `.dialog` |
| Notification toasts | `.notification` |
| Error toasts | `.notification.error` |
| SR5 character sheet | `.shadowrun5e.sheet.actor.character` |

## Checking for Console Errors

```js
// After an interaction, check for error notifications in the UI
[...document.querySelectorAll('.notification.error')].map(el => el.textContent.trim())
```

> **Note:** Warnings about `CONST.ACTIVE_EFFECT_MODES` in the console are expected SR5e deprecation notices for Foundry v14 and can be ignored.
