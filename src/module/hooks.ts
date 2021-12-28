import { SR5 } from './config';
import { Migrator } from './migrator/Migrator';
import { registerSystemSettings } from './settings';
import {FLAGS, SYSTEM_NAME, SYSTEM_SOCKET} from './constants';
import { SR5Actor } from './actor/SR5Actor';
import { SR5ActorSheet } from './actor/SR5ActorSheet';
import { SR5Item } from './item/SR5Item';
import { SR5ItemSheet } from './item/SR5ItemSheet';
import { SR5Token } from './token/SR5Token';
import { ShadowrunRoller } from './rolls/ShadowrunRoller';
import { Helpers } from './helpers';
import { HandlebarManager } from './handlebars/HandlebarManager';
import { measureDistance } from './canvas';
import * as chat from './chat';
import {createItemMacro, createSkillMacro, rollItemMacro, rollSkillMacro} from './macros';

import { OverwatchScoreTracker } from './apps/gmtools/OverwatchScoreTracker';
import {_combatantGetInitiativeFormula, SR5Combat} from './combat/SR5Combat';
import { Import } from './importer/apps/import-form';
import {ChangelogApplication} from "./apps/ChangelogApplication";
import {EnvModifiersApplication} from "./apps/EnvModifiersApplication";
import {quenchRegister} from "../test/quench";
import {SR5ICActorSheet} from "./actor/sheets/SR5ICActorSheet";
import ShadowrunItemDataData = Shadowrun.ShadowrunItemDataData;
import SocketMessageHooks = Shadowrun.SocketMessageHooks;
import SocketMessage = Shadowrun.SocketMessageData;
import {SR5ActiveEffect} from "./effect/SR5ActiveEffect";
import {SR5ActiveEffectSheet} from "./effect/SR5ActiveEffectSheet";
import {NetworkDeviceFlow} from "./item/flows/NetworkDeviceFlow";
import {SR5VehicleActorSheet} from "./actor/sheets/SR5VehicleActorSheet";

// Redeclare SR5config as a global as foundry-vtt-types CONFIG with SR5 property causes issues.
export const SR5CONFIG = SR5;

export class HooksManager {
    static registerHooks() {
        console.log('Shadowrun 5e | Registering system hooks');
        // Register your highest level hook callbacks here for a quick overview of what's hooked into.

        Hooks.once('init', HooksManager.init);
        Hooks.once('setup', HooksManager.setupAutocompleteInlinePropertiesSupport);

        Hooks.on('canvasInit', HooksManager.canvasInit);
        Hooks.on('ready', HooksManager.ready);
        Hooks.on('renderChatMessage', HooksManager.renderChatMessage);
        Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
        Hooks.on('hotbarDrop', HooksManager.hotbarDrop);
        Hooks.on('renderSceneControls', HooksManager.renderSceneControls);
        Hooks.on('getSceneControlButtons', HooksManager.getSceneControlButtons);
        Hooks.on('getCombatTrackerEntryContext', SR5Combat.addCombatTrackerContextOptions);
        Hooks.on('renderItemDirectory', HooksManager.renderItemDirectory);
        Hooks.on('renderTokenHUD', EnvModifiersApplication.addTokenHUDFields);
        Hooks.on('updateItem', HooksManager.updateIcConnectedToHostItem);
        Hooks.on('deleteItem', HooksManager.removeDeletedItemsFromNetworks);

        // Foundry VTT Module 'quench': https://github.com/schultzcole/FVTT-Quench
        Hooks.on('quenchReady', quenchRegister);
    }

    static init() {
        console.log(`Loading Shadowrun 5e System
___________________
 ___________ _____ 
/  ___| ___ \\  ___|
\\ \`--.| |_/ /___ \\ 
 \`--. \\    /    \\ \\
/\\__/ / |\\ \\/\\__/ /
\\____/\\_| \\_\\____/ 
===================
`);
        // Create a shadowrun5e namespace within the game global
        game['shadowrun5e'] = {
            SR5Actor,
            ShadowrunRoller,
            SR5Item,
            rollItemMacro,
            rollSkillMacro
        };

        CONFIG.Actor.documentClass = SR5Actor;
        CONFIG.Item.documentClass = SR5Item;
        // @ts-ignore // TODO: Compare Combat/SR5Combat typing.
        CONFIG.Combat.documentClass = SR5Combat;
        CONFIG.ActiveEffect.documentClass = SR5ActiveEffect;
        CONFIG.ActiveEffect.sheetClass = SR5ActiveEffectSheet;
        CONFIG.Token.objectClass = SR5Token;
        // Register initiative directly (outside of system.json) as DnD5e does it.
        CONFIG.Combat.initiative.formula =  "@initiative.current.base.value[Base] + @initiative.current.dice.text[Dice] - @wounds.value[Wounds]";
        // @ts-ignore
        Combatant.prototype._getInitiativeFormula = _combatantGetInitiativeFormula;

        // Add Shadowrun configuration onto general Foundry config for module access.
        // @ts-ignore // TODO: Add declaration merging
        CONFIG.SR5 = SR5;


        registerSystemSettings();

        // Register sheet application classes
        // NOTE: See dnd5e for a multi class approach for all actor types using the types array in Actors.registerSheet
        Actors.unregisterSheet('core', ActorSheet);
        Actors.registerSheet(SYSTEM_NAME, SR5ActorSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['character', 'critter', 'spirit', 'sprite']
        });
        Actors.registerSheet(SYSTEM_NAME, SR5ICActorSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['ic']
        });
        Actors.registerSheet(SYSTEM_NAME, SR5VehicleActorSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['vehicle']
        });


        Items.unregisterSheet('core', ItemSheet);
        Items.registerSheet(SYSTEM_NAME, SR5ItemSheet, {
            label: "SR5.SheetItem",
            makeDefault: true
        });

        ['renderSR5ActorSheet', 'renderSR5ItemSheet'].forEach((s) => {
            Hooks.on(s, (app, html) => Helpers.setupCustomCheckbox(app, html));
        });

        HooksManager.registerSocketListeners();

        HandlebarManager.loadTemplates();
    }

    static async ready() {
        if (game.user?.isGM) {
            await Migrator.BeginMigration();

            if (ChangelogApplication.showApplication) {
                await new ChangelogApplication().render(true);
            }

        }

        // TODO make based on foundry version
        const diceIconSelector = '#chat-controls .roll-type-select .fa-dice-d20';
        $(document).on('click', diceIconSelector, () => ShadowrunRoller.promptRoll());
        const diceIconSelectorNew = '#chat-controls .chat-control-icon .fa-dice-d20';
        $(document).on('click', diceIconSelectorNew, () => ShadowrunRoller.promptRoll());
    }

    static canvasInit() {
        if (!canvas?.ready) return;
        // @ts-ignore // TODO: canvas.grid.diagonaleRule doesn't exist on  anymore... does this even work anymore?
        canvas.grid.diagonalRule = game.settings.get(SYSTEM_NAME, 'diagonalMovement');
        //@ts-ignore // TODO: TYPE SquareGrid isn't typed.
        SquareGrid.prototype.measureDistances = measureDistance;
    }

    /**
     * Hanlde drop events on the hotbar creating different macros
     *
     * @param bar
     * @param data
     * @param slot
     * @return false NOTE: when the hook call propagation should be stopped.
     */
    static async hotbarDrop(bar, data, slot) {
        switch (data.type) {
            case 'Item':
                await createItemMacro(data.data, slot);
                return false;
            case 'Skill':
                await createSkillMacro(data.data, slot);
                return false;
            default:
                return;
        }
    }

    static renderSceneControls(controls, html) {
        html.find('[data-tool="overwatch-score-tracker"]').on('click', (event) => {
            event.preventDefault();
            new OverwatchScoreTracker().render(true);
        });
    }

    static getSceneControlButtons(controls) {
        const tokenControls = controls.find((c) => c.name === 'token');

        if (game.user?.isGM) {
            tokenControls.tools.push({
                name: 'overwatch-score-tracker',
                title: 'CONTROLS.SR5.OverwatchScoreTracker',
                icon: 'fas fa-network-wired',
                button: true
            });
        }

        tokenControls.tools.push(EnvModifiersApplication.getControl());
    }

    static renderChatMessage(message, html, data) {
        chat.addRollListeners(message, html);
    }

    static renderItemDirectory(app: Application, html: JQuery) {
        const button = $('<button>Import Chummer Data</button>');
        html.find('footer').before(button);
        button.on('click', (event) => {
            new Import().render(true);
        });
    }

    /**
     * On each
     * @param item
     * @param data
     * @param id
     */
    static async updateIcConnectedToHostItem(item: SR5Item, data: ShadowrunItemDataData, id: string) {
        if (!canvas.ready || !game.actors) return;

        if (item.isHost()) {
            // Collect actors from sidebar and active scene to update / rerender
            let connectedIC = [
                // All sidebar actors should also include tokens with linked actors.
                ...game.actors.filter((actor: SR5Actor) => actor.isIC() && actor.hasHost()) as SR5Actor[],
                // All token actors that aren't linked.
                // @ts-ignore
                ...canvas.scene.tokens.filter(token => !token.data.actorLink && token.actor?.isIC() && token.actor?.hasHost()).map(t => t.actor)
            ];

            // Update host data on the ic actor.
            const hostData = item.asHostData();
            if (!hostData) return;
            for (const ic of connectedIC) {
                if (!ic) continue;
                await ic._updateICHostData(hostData);
            }
        }
    }

    static async removeDeletedItemsFromNetworks(item: SR5Item, data: ShadowrunItemDataData, id: string) {
        await NetworkDeviceFlow.handleOnDeleteItem(item, data, id);
    }

    /**
     * This method is used as a simple place to register socket hook handlers for the system.
     *
     * You can use the SocketMessage
     */
    static registerSocketListeners() {
        if (!game.socket || !game.user) return;
        console.log('Registering Shadowrun5e system socket messages...');
        const hooks: SocketMessageHooks = {
            [FLAGS.addNetworkController]: [NetworkDeviceFlow._handleAddNetworkControllerSocketMessage],
            [FLAGS.DoNextRound]: [SR5Combat._handleDoNextRoundSocketMessage],
            [FLAGS.DoInitPass]: [SR5Combat._handleDoInitPassSocketMessage],
        }

        game.socket.on(SYSTEM_SOCKET, async (message: SocketMessage) => {
            console.log('Shadowrun 5e | Received system socket message.', message);

            const handlers = hooks[message.type];
            if (!handlers || handlers.length === 0) return console.warn('Shadowrun 5e | System socket message has no registered handler!', message);
            // In case of targeted socket message only execute with target user (intended for GM usage)
            if (message.userId && game.user?.id !== message.userId) return;
            if (message.userId && game.user?.id) console.log('Shadowrun 5e | GM is handling system socket message');

            for (const handler of handlers) {
                console.log('Shadowrun 5e | Handover system socket message to handler', handler);
                await handler(message);
            }
        });
    }

    /**
     * Add support for https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties module
     * to give auto complete for active effect attribute keys.
     *
     * This is taken from: https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/CONTRIBUTING.md
     * It partially uses: https://github.com/schultzcole/FVTT-Autocomplete-Inline-Properties/blob/master/package-config.mjs#L141
     */
    static setupAutocompleteInlinePropertiesSupport() {
        // Module might not be installed.
        const aipModule = game.modules.get("autocomplete-inline-properties");
        if (!aipModule) return;
        // @ts-ignore
        // API might be missing.
        const api = aipModule.API;
        if (!api) return;

        console.log('Shadowrun 5e | Registering support for autocomplete-inline-properties');
        // @ts-ignore
        const DATA_MODE = api.CONST.DATA_MODE;

        const config = {
            packageName: "shadowrun5e",
            sheetClasses: [{
                name: "ActiveEffectConfig",
                fieldConfigs: [
                    { selector: `.tab[data-tab="effects"] .key input[type="text"]`, defaultPath: "data", showButton: true, allowHotkey: true, dataMode: DATA_MODE.OWNING_ACTOR_DATA },
                ]
            }]
        };

        // @ts-ignore
        api.PACKAGE_CONFIG.push(config);
    }
}
