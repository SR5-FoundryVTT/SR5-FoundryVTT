import { SR5ItemSheet } from './item/SR5ItemSheet';
import { SR5ActorSheet } from './actor/SR5ActorSheet';
import { SR5Actor } from './actor/SR5Actor';
import { SR5Item } from './item/SR5Item';
import { SR5 } from './config';
import { Helpers } from './helpers';
import { registerSystemSettings } from './settings';
import { preCombatUpdate, shadowrunCombatUpdate } from './combat';
import { measureDistance } from './canvas';
import * as chat from './chat';
import { OverwatchScoreTracker } from './apps/gmtools/OverwatchScoreTracker';
import { registerHandlebarHelpers, preloadHandlebarsTemplates } from './handlebars';
import { ShadowrunRoller } from './rolls/ShadowrunRoller';
import { Migrator } from './migrator/Migrator';

/* -------------------------------------------- */
/*  Foundry VTT Initialization                  */
/* -------------------------------------------- */

Hooks.once('init', function () {
    console.log('Loading Shadowrun 5e System');

    // Create a shadowrun5e namespace within the game global
    game['shadowrun5e'] = {
        SR5Actor,
        ShadowrunRoller,
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
    // this is correct, will need to be fixed in foundry types
    // @ts-ignore
    game.socket.on('system.shadowrun5e', (data) => {
        if (game.user.isGM && data.gmCombatUpdate) {
            shadowrunCombatUpdate(data.gmCombatUpdate.changes, data.gmCombatUpdate.options);
        }
    });

    Migrator.BeginMigration();
});

Hooks.on('preUpdateCombat', preCombatUpdate);
Hooks.on('renderChatMessage', (app, html) => {
    if (app.isRoll) chat.addRollListeners(app, html);
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

    return item.rollTest(event);
}

registerHandlebarHelpers();
