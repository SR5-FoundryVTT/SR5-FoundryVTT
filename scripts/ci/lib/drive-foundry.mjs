/**
 * Drive a running Foundry instance with Playwright Chromium and return Quench
 * results.
 */
import { chromium } from 'playwright';
import { runQuenchInPage } from './quench-runner.mjs';

const log = (...args) => console.info('[drive]', ...args);

async function waitForGameReady(page, timeout = 120000) {
    await page.waitForFunction(() => globalThis.game !== undefined && globalThis.game.ready === true, null, {
        timeout,
    });
}

function pathname(page) {
    return new URL(page.url()).pathname;
}

async function acceptLicenseIfNeeded(page) {
    if (!pathname(page).endsWith('/license')) return false;

    log('accepting Foundry license/EULA screen');
    const agree = page.locator('#eula-agree, [name=agree]').first();
    await agree.waitFor({ timeout: 30000 });
    await agree.check();

    await Promise.all([
        page.waitForFunction(() => !globalThis.location.pathname.endsWith('/license'), null, { timeout: 60000 }),
        page.locator('#sign, [name=accept]').first().click(),
    ]);
    return true;
}

async function declineUsageSharingIfPresent(page) {
    const decline = page.locator('button[data-action="no"]').first();
    try {
        if (await decline.isVisible({ timeout: 3000 })) await decline.click();
    } catch {
        // Optional first-run prompt.
    }
}

async function launchWorldFromSetup(page, world) {
    if (!pathname(page).endsWith('/setup')) return false;

    log(`launching world "${world}" from setup`);
    await declineUsageSharingIfPresent(page);

    await page.locator(`li.package.world[data-package-id="${world}"]`).first().waitFor({ timeout: 30000 });
    const response = await page.evaluate(async (worldId) => {
        const url = foundry.utils.getRoute('/setup');
        const result = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'launchWorld', world: worldId }),
        });
        return { ok: result.ok, status: result.status, url: result.url, text: await result.text() };
    }, world);
    if (!response.ok) {
        throw new Error(`Failed to launch world "${world}" from setup: HTTP ${response.status} ${response.text}`);
    }

    await page.goto('/', { waitUntil: 'domcontentloaded' });
    return true;
}

async function joinAsGamemaster(page, world) {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await acceptLicenseIfNeeded(page);
    await launchWorldFromSetup(page, world);

    const currentPath = pathname(page);
    if (currentPath.endsWith('/game')) {
        await waitForGameReady(page);
        return;
    }
    if (currentPath.endsWith('/auth')) {
        throw new Error(
            'Foundry stopped on /auth because an Administrator Access Key is configured. ' +
                'For ephemeral Quench CI, unset/override FOUNDRY_ADMIN_KEY so felddy does not add this gate.',
        );
    }
    if (currentPath.endsWith('/setup')) {
        throw new Error(
            `Foundry stopped on /setup and the "${world}" world could not be launched. ` +
                'Check that FOUNDRY_WORLD is set and the world exists in the mounted Data directory.',
        );
    }
    if (!currentPath.endsWith('/join')) {
        throw new Error(
            `Expected to land on /join (the world should be auto-launched) but got "${currentPath}". ` +
                'Check that FOUNDRY_WORLD is set and the world launched successfully.',
        );
    }

    const select = page.locator('[name=userid]');
    await select.waitFor({ timeout: 30000 });
    try {
        await select.selectOption({ label: 'Gamemaster' });
    } catch {
        const options = await select.locator('option').evaluateAll((opts) =>
            opts.map((o) => ({ value: o.value, text: (o.textContent ?? '').trim() })),
        );
        const gm = options.find((o) => /game ?master/i.test(o.text)) ?? options[options.length - 1];
        await select.selectOption(gm.value);
    }

    await Promise.all([page.waitForURL('**/game', { timeout: 60000 }), page.click('[name=join]')]);
    await waitForGameReady(page);
}

async function quenchReady(page, timeout) {
    return page
        .waitForFunction(() => typeof globalThis.quench !== 'undefined', null, { timeout })
        .then(() => true)
        .catch(() => false);
}

async function ensureQuenchActive(page, world) {
    if (await quenchReady(page, 8000)) {
        log('Quench already active');
        return false;
    }

    log('Quench not active, enabling via world module configuration');
    await page.evaluate(async () => {
        const cfg = { ...(game.settings.get('core', 'moduleConfiguration') ?? {}) };
        cfg['quench'] = true;
        await game.settings.set('core', 'moduleConfiguration', cfg);
    });

    await joinAsGamemaster(page, world);
    if (!(await quenchReady(page, 60000))) {
        throw new Error('Quench still inactive after enabling and reloading.');
    }
    return true;
}

/**
 * @param {object} config
 * @param {string} config.url        Foundry base URL
 * @param {string} [config.world]    world id to launch from setup if needed
 * @param {string} [config.pattern]  Quench batch glob (default shadowrun5e.**)
 * @param {boolean} [config.headless] run headless (default true)
 * @returns {Promise<object>} Quench summary { stats, failures, ... }
 */
export async function driveQuench(config) {
    const cfg = {
        world: 'sr5-quench',
        pattern: 'shadowrun5e.**',
        runTimeoutMs: 10 * 60 * 1000,
        headless: true,
        ...config,
    };
    if (!cfg.url) throw new Error('driveQuench: config.url is required');

    const args = ['--enable-gpu', '--ignore-gpu-blocklist'];
    const viewport = cfg.headless ? { width: 1024, height: 768 } : null;
    if (!cfg.headless) args.push('--start-maximized');

    const browser = await chromium.launch({ headless: cfg.headless, args });
    try {
        const context = await browser.newContext({ baseURL: cfg.url, viewport });
        const page = await context.newPage();
        page.on('console', (msg) => {
            if (process.env.QUENCH_PAGE_LOGS === '1' || msg.type() === 'error') {
                console.log(`[page:${msg.type()}]`, msg.text());
            }
        });
        page.on('pageerror', (err) => console.log('[page:error]', err.message));

        log(`opening ${cfg.url}`);
        await joinAsGamemaster(page, cfg.world);
        await ensureQuenchActive(page, cfg.world);

        log(`running Quench batches "${cfg.pattern}"`);
        return await runQuenchInPage(page, {
            pattern: cfg.pattern,
            runTimeoutMs: cfg.runTimeoutMs,
        });
    } finally {
        await browser.close();
    }
}
