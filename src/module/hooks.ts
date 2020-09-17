import {SR5} from "./config";
import {Migrator} from "./migrator/Migrator";
import {registerSystemSettings} from "./settings";
import {SYSTEM_NAME} from "./constants";
import {SR5Actor} from "./actor/SR5Actor";
import {SR5ActorSheet} from "./actor/SR5ActorSheet";
import {SR5Item} from "./item/SR5Item";
import {SR5ItemSheet} from "./item/SR5ItemSheet";
import {ShadowrunRoller} from "./rolls/ShadowrunRoller";
import {Helpers} from "./helpers";
import {HandlebarManager} from "./handlebars/HandlebarManager";
import {measureDistance} from "./canvas";
import {preCombatUpdate, shadowrunCombatUpdate} from "./combat";
import * as chat from "./chat";
import {createItemMacro, rollItemMacro} from "./macros";

import { OverwatchScoreTracker } from './apps/gmtools/OverwatchScoreTracker';

export class HooksManager {
    static registerHooks() {
        // Register your highest level hook callbacks here for a quick overview of what's hooked into.

        Hooks.once('init', HooksManager.init);

        Hooks.on('canvasInit', HooksManager.canvasInit);
        Hooks.on('ready', HooksManager.ready);
        Hooks.on('renderChatMessage', HooksManager.readyChatMessage);
        Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
        Hooks.on('hotbarDrop', HooksManager.hotbarDrop);
        Hooks.on('renderSceneControls', HooksManager.renderSceneControls);
        Hooks.on('getSceneControlButtons', HooksManager.getSceneControlButtons);
        Hooks.on('preCreateToken', HooksManager.preCreateToken);

        Hooks.on('preUpdateCombat', preCombatUpdate);
    }

    static init() {
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
        Actors.registerSheet(SYSTEM_NAME, SR5ActorSheet, {makeDefault: true});
        Items.unregisterSheet('core', ItemSheet);
        Items.registerSheet(SYSTEM_NAME, SR5ItemSheet, {makeDefault: true});

        ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
            Hooks.on(s, (app, html) => Helpers.setupCustomCheckbox(app, html));
        });

        HandlebarManager.loadTemplates();
    }

    static async ready() {
        game.socket.on('system.shadowrun5e', async (data) => {
            if (game.user.isGM && data.gmCombatUpdate) {
                await shadowrunCombatUpdate(data.gmCombatUpdate.changes, data.gmCombatUpdate.options);
            }
        });

        if (game.user.isGM) {
            await Migrator.BeginMigration();
        }

        const diceIconSelector = '#chat-controls .roll-type-select .fa-dice-d20';
        $(document).on('click', diceIconSelector, () => ShadowrunRoller.promptRoll());
    }

    static canvasInit() {
        //@ts-ignore
        // SquareGrid isn't typed.
        SquareGrid.prototype.measureDistance = measureDistance;
    }

    static hotbarDrop(bar, data, slot): boolean {
        if (data.type === 'Item') {
            // Promise can't be honored in this non-async function scope, as it needs to return a boolean.
            createItemMacro(data.data, slot);
        }

        return false;
    }

    static renderSceneControls(controls, html) {
        html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
            event.preventDefault();
            new OverwatchScoreTracker().render(true);
        });
    }

    static getSceneControlButtons(controls) {
        if (game.user.isGM) {
            const tokenControls = controls.find((c) => c.name === 'token');
            tokenControls.tools.push({
                name: 'overwatch-score-tracker',
                title: 'CONTROLS.SR5.OverwatchScoreTracker',
                icon: 'fas fa-network-wired',
            });
        }
    }

    static readyChatMessage(app, html) {
        chat.addRollListeners(app, html);
    }

    static preCreateToken(scene, tokenData, options, tokenId) {
        console.error('preCreateToken', tokenData);

        /** Grunt mechanism
         * Stuff we need:
         *  1. Connect multiple tokens to one actor
         *  Doable (see below) token.actor and game.actor[x] are referential equal!
         *  2. Add all tokens to combat, however change all token combat entries initiatives at the same time
         *      Do this with the assumption that each grunt actor is one 'role' in the grunt group. Therefore, rules
         *      'better' rules within the same group are interpreted to mean each role has one initiative.
         *  3. Remove P/S track and add a simple damage track
         *    (Zustandsmonitor hat eine Anzahl Kästchen, die der aufgerundeten
                Hälfte ihrer Konstitution oder Willenskraft (dem höheren
                der beiden Werte) plus 8 entspricht)
         Stuff to test
            ToDos
            - Role aus Daten und template entfernen
            - Check if prepareNPCData is needed for new actor fields


            preCreateToken tokenData beinhaltet Feld 'randomImg'... Wie kann das denn benutzt werden?
         */

        const actor = game.actors.get(tokenData.actorId);
        if (actor.data.data.is_npc && actor.data.data.npc.is_grunt) {
            if (!tokenData.actorLink) {
                console.error('Token needs to be directly linked!');
            } else {
                console.error('Grunt has been added!');
                canvas.tokens.placeables.forEach(token => {
                    console.error('-------------');
                    console.error(token);
                    console.error(token.data.actorLink, token.data.actorId);
                    console.error(token.actor);
                    console.error(token.actor === actor);
                })
            }
        }
    }
}