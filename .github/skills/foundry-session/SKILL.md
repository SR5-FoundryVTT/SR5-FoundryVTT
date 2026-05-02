---
name: foundry-session
description: 'Interact with a live Foundry Virtual Tabletop browser session running at http://localhost:30000. Use when: opening Foundry, logging in as Gamemaster, navigating the UI, opening actor/item sheets, running macros, inspecting game data via the browser console, verifying changes in the running game world, testing system features. Requires a world to be active and a browser page open on localhost:30000.'
argument-hint: 'What do you want to do in the Foundry session?'
---

# Foundry Session Interaction

## When to Use
- Verifying a code change behaves correctly in-game
- Inspecting actor/item data in the live world
- Opening and interacting with character sheets
- Navigating UI panels (Actors, Items, Scenes, etc.)
- Running macros or chat commands
- Taking screenshots of UI state for debugging

## Prerequisites

- The FoundryVTT server must be running at `http://localhost:30000`
- A world must be **active** (the join/login screen must be visible)
- The browser page at `http://localhost:30000` must be available in the current session

## Step 1 — Check Current Session State

Use `read_page` or `screenshot_page` on the active browser page to determine the current URL:

| URL | State |
|-----|-------|
| `http://localhost:30000/join` | Login screen — world is active, not yet joined |
| `http://localhost:30000/game` | Inside the world as Gamemaster |
| `http://localhost:30000/` or setup pages | No world active — must launch one first |

## Step 2 — Log In (if on `/join`)

The login screen shows "Join Game Session" with a user dropdown. **Gamemaster is available by default with no password.**

```js
// Playwright code to log in
await page.selectOption('select[name="userid"]', { label: 'Gamemaster' });
await page.click('button[name="join"]');
await page.waitForLoadState('networkidle');
```

Confirm success: a flash message "Login as Gamemaster successful, joining game!" appears and the URL changes to `/game`.

## Step 3 — Navigate the Game UI

### Left Toolbar (Scene Layer Controls)
Controls are tabs on the far left. The active tab determines which sub-tools appear below it.

| Tab Label | Purpose |
|-----------|---------|
| Token Controls | Select/target tokens (default) |
| Tile Controls | Place and move tiles |
| Drawing Tools | Freehand drawing on canvas |
| Wall Controls | Place walls |
| Lighting Controls | Place light sources |
| Ambient Sound Controls | Place ambient sounds |
| Region Controls | Draw scene regions |
| Journal Notes | Place map pin notes |

SR5-specific sub-tools under Token Controls:
- **Overwatch Score Tracker** — tracks matrix overwatch in Shadowrun 5e
- **Situational Modifiers** — opens the `SituationModifiers` panel

### Right Sidebar (Document Panels)
Click the tab icons to open a panel. Tabs (left to right):

`Chat Messages` · `Combat Encounters` · `Scenes` · `Placeables` · `Actors` · `Items` · `Journal` · `Rollable Tables` · `Card Stacks` · `Macros` · `Playlists` · `Compendium Packs` · `Game Settings`

To open a panel:
```js
// Click by tab label
await page.click('[aria-label="Actors"]');
// Or use the ref from a snapshot
await page.click('tab:has-text("Actors")');
```

### Bottom Hotbar
10 macro slots (keys 1–0), with paging controls and lock/clear buttons.

### Chat Input
Located at the bottom right. Accepts chat messages and slash commands:
- `/r NdN` — roll dice (e.g. `/r 12d6`)
- Chat visibility buttons: Public · Private (GM only) · Blind · Self

## Step 4 — Open Documents (Actors / Items)

1. Click the **Actors** or **Items** tab in the right sidebar to open the panel
2. Double-click an entity name to open its sheet
3. The sheet opens as a floating window on the canvas

To open an actor sheet via Playwright:
```js
await page.click('tab:has-text("Actors")');
await page.dblclick('text=<ActorName>');
```

## Step 5 — Run Code via Browser Console

Use `run_playwright_code` to evaluate JavaScript in the page context:

```js
// Example: list all actors
const actors = await page.evaluate(() =>
  game.actors.map(a => ({ id: a.id, name: a.name, type: a.type }))
);
```

Useful global objects in the Foundry context:

| Object | Purpose |
|--------|---------|
| `game.actors` | All actor documents |
| `game.items` | All item documents |
| `game.scenes` | All scene documents |
| `game.users` | All user documents |
| `canvas.tokens` | Tokens on the active scene |
| `ui.notifications` | Notification UI |
| `Hooks` | Hook system |

## Step 6 — Verify State

After an interaction, call `screenshot_page` to capture the current visible UI, or `read_page` for a DOM snapshot. Use these to confirm:
- Sheets opened correctly
- Values updated as expected
- No visible error notifications in the UI

## Common Patterns

### Reload the system bundle (after a build)
```js
// Navigate away and back to force a full page reload
await page.goto('http://localhost:30000/join');
await page.selectOption('select[name="userid"]', { label: 'Gamemaster' });
await page.click('button[name="join"]');
await page.waitForLoadState('networkidle');
```

### Check for UI error notifications
```js
const errors = await page.evaluate(() =>
  [...document.querySelectorAll('.notification.error')].map(el => el.textContent)
);
```

### Open Gamemaster settings
```js
await page.click('tab:has-text("Game Settings")');
```

## Notes

- The world name is `sr-test-14-v2` (shown as the page title on `/join`)
- Foundry version is **14 Build 357**
- The SR5e system bundle is at `/systems/shadowrun5e/dist/bundle.js`
- Console warnings about `CONST.ACTIVE_EFFECT_MODES` are expected deprecation notices (SR5e compatibility issue with FVTTv14); they do not indicate failures
