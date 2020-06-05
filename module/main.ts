// Import Modules
import { SR5ItemSheet } from './item/SR5ItemSheet';
import { SR5ActorSheet } from './actor/SR5ActorSheet';
import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import { SR5 } from './config';
import { Helpers } from './helpers';
import { registerSystemSettings } from './settings';
import { preloadHandlebarsTemplates } from './templates';
import { DiceSR } from './dice';
import { preCombatUpdate, shadowrunCombatUpdate } from './combat';
import { measureDistance } from './canvas';
import * as chat from './chat';
import * as migrations from './migration';
import { OverwatchScoreTracker } from './apps/gmtools/OverwatchScoreTracker';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function () {
    console.log('Loading Shadowrun 5e System');

    // Create a shadowrun5e namespace within the game global
    game['shadowrun5e'] = {
        SR5Actor,
        DiceSR,
        SR5Item,
        rollItemMacro,
    };

    CONFIG.SR5 = SR5;
    CONFIG.Actor.entityClass = SR5Actor;
    CONFIG.Item.entityClass = SR5Item;

    registerSystemSettings();

    // Register sheet application classes
    Actors.unregisterSheet('core', ActorSheet);
    Actors.registerSheet('shadowrun5e', SR5ActorSheet, { makeDefault: true });
    Items.unregisterSheet('core', ItemSheet);
    Items.registerSheet('shadowrun5e', SR5ItemSheet, { makeDefault: true });

    ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
        Hooks.on(s, (app, html) => Helpers.setupCustomCheckbox(app, html));
    });

    preloadHandlebarsTemplates();

    // CONFIG.debug.hooks = true;
});

Hooks.on('canvasInit', function () {
    // this does actually exist. Fix in types?
    // @ts-ignore
    SquareGrid.prototype.measureDistance = measureDistance;
});

Hooks.on('ready', function () {
    console.log(game.socket);

    // this is correct, will need to be fixed in foundry types
    // @ts-ignore
    game.socket.on('system.shadowrun5e', (data) => {
        if (game.user.isGM && data.gmCombatUpdate) {
            shadowrunCombatUpdate(data.gmCombatUpdate.changes, data.gmCombatUpdate.options);
        }
        console.log(data);
    });

    // Determine whether a system migration is required and feasible
    const currentVersion = game.settings.get('shadowrun5e', 'systemMigrationVersion');
    // the latest version that requires migration
    const NEEDS_MIGRATION_VERSION = '0.5.12';
    let needMigration =
        currentVersion === null || compareVersion(currentVersion, NEEDS_MIGRATION_VERSION) < 0;

    // Perform the migration
    if (needMigration && game.user.isGM) {
        migrations.migrateWorld();
    }
});

Hooks.on('preUpdateCombat', preCombatUpdate);
Hooks.on('renderChatMessage', (app, html) => {
    if (!app.isRoll) SR5Item.chatListeners(html);
    if (app.isRoll) chat.highlightSuccessFailure(app, html);
});
Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);

/* -------------------------------------------- */
/*  Hotbar Macros                               */
/* -------------------------------------------- */

Hooks.on('hotbarDrop', (bar, data, slot) => {
    if (data.type !== 'Item') return;

    createItemMacro(data.data, slot);
    return false;
});

Hooks.on('renderSceneControls', (controls, html) => {
    html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
        event.preventDefault();
        new OverwatchScoreTracker().render(true);
    });
});

Hooks.on('getSceneControlButtons', (controls) => {
    if (game.user.isGM) {
        const tokenControls = controls.find((c) => c.name === 'token');
        tokenControls.tools.push({
            name: 'overwatch-score-tracker',
            title: 'CONTROLS.SR5.OverwatchScoreTracker',
            icon: 'fas fa-network-wired',
        });
    }
});

// found at: https://helloacm.com/the-javascript-function-to-compare-version-number-strings/
function compareVersion(v1, v2) {
    if (typeof v1 !== 'string') return false;
    if (typeof v2 !== 'string') return false;
    v1 = v1.split('.');
    v2 = v2.split('.');
    const k = Math.min(v1.length, v2.length);
    for (let i = 0; i < k; ++i) {
        v1[i] = parseInt(v1[i], 10);
        v2[i] = parseInt(v2[i], 10);
        if (v1[i] > v2[i]) return 1;
        if (v1[i] < v2[i]) return -1;
    }
    return v1.length === v2.length ? 0 : v1.length < v2.length ? -1 : 1;
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {Object} item     The item data
 * @param {number} slot     The hotbar slot to use
 * @returns {Promise}
 */
async function createItemMacro(item, slot) {
    const command = `game.shadowrun5e.rollItemMacro("${item.name}");`;
    let macro = game.macros.entities.find((m) => m.name === item.name);
    if (!macro) {
        macro = (await Macro.create(
            {
                name: item.name,
                type: 'script',
                img: item.img,
                command: command,
                flags: { 'shadowrun5e.itemMacro': true },
            },
            { displaySheet: false }
        )) as Macro;
    }
    if (macro) game.user.assignHotbarMacro(macro, slot);
}

/**
 * Create a Macro from an Item drop.
 * Get an existing item macro if one exists, otherwise create a new one.
 * @param {string} itemName
 * @return {Promise}
 */
function rollItemMacro(itemName) {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find((i) => i.name === itemName) : null;
    if (!item) {
        // @ts-ignore
        return ui.notifications.warn(
            `Your controlled Actor does not have an item named ${itemName}`
        );
    }

    return item.roll();
}

Handlebars.registerHelper('localizeOb', function (strId, obj) {
    if (obj) strId = obj[strId];
    return game.i18n.localize(strId);
});

Handlebars.registerHelper('toHeaderCase', function (str) {
    if (str) return Helpers.label(str);
    return '';
});

Handlebars.registerHelper('concat', function (strs, c = ',') {
    if (Array.isArray(strs)) {
        return strs.join(c);
    }
    return strs;
});
Handlebars.registerHelper('hasprop', function (obj, prop, options) {
    if (obj.hasOwnProperty(prop)) {
        return options.fn(this);
    } else return options.inverse(this);
});
Handlebars.registerHelper('ifin', function (val, arr, options) {
    if (arr.includes(val)) return options.fn(this);
    else return options.inverse(this);
});
// if greater than
Handlebars.registerHelper('ifgt', function (v1, v2, options) {
    if (v1 > v2) return options.fn(this);
    else return options.inverse(this);
});
// if not equal
Handlebars.registerHelper('ifne', function (v1, v2, options) {
    if (v1 !== v2) return options.fn(this);
    else return options.inverse(this);
});
// if equal
Handlebars.registerHelper('ife', function (v1, v2, options) {
    if (v1 === v2) return options.fn(this);
    else return options.inverse(this);
});
Handlebars.registerHelper('sum', function (v1, v2) {
    return v1 + v2;
});
Handlebars.registerHelper('damageAbbreviation', function (damage) {
    if (damage === 'physical') return 'P';
    if (damage === 'stun') return 'S';
    if (damage === 'matrix') return 'M';
    return '';
});
