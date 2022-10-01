import {SR5} from './config';
import {Migrator} from './migrator/Migrator';
import {registerSystemSettings} from './settings';
import {FLAGS, SYSTEM_NAME, SYSTEM_SOCKET} from './constants';
import {SR5Actor} from './actor/SR5Actor';
import {SR5Item} from './item/SR5Item';
import {SR5ItemSheet} from './item/SR5ItemSheet';
import {SR5Token} from './token/SR5Token';
import {ShadowrunRoller} from './rolls/ShadowrunRoller';
import {HandlebarManager} from './handlebars/HandlebarManager';
import {measureDistance} from './canvas';
import {createItemMacro, createSkillMacro, rollItemMacro, rollSkillMacro} from './macros';

import {OverwatchScoreTracker} from './apps/gmtools/OverwatchScoreTracker';
import {_combatantGetInitiativeFormula, SR5Combat} from './combat/SR5Combat';
import {Import} from './importer/apps/import-form';
import {ChangelogApplication} from "./apps/ChangelogApplication";
import {EnvModifiersApplication} from "./apps/EnvModifiersApplication";
import {quenchRegister} from "../test/quench";
import {SR5ICActorSheet} from "./actor/sheets/SR5ICActorSheet";
import {SR5ActiveEffect} from "./effect/SR5ActiveEffect";
import {SR5ActiveEffectConfig} from "./effect/SR5ActiveEffectConfig";
import {NetworkDeviceFlow} from "./item/flows/NetworkDeviceFlow";
import {SR5VehicleActorSheet} from "./actor/sheets/SR5VehicleActorSheet";
import {SR5CharacterSheet} from "./actor/sheets/SR5CharacterSheet";
import {SR5SpiritActorSheet} from "./actor/sheets/SR5SpiritActorSheet";
import {SR5SpriteActorSheet} from "./actor/sheets/SR5SpriteActorSheet";

import {SR5Roll} from "./rolls/SR5Roll";
import {PhysicalDefenseTest} from "./tests/PhysicalDefenseTest";
import {RangedAttackTest} from "./tests/RangedAttackTest";
import {SuccessTest} from "./tests/SuccessTest";
import {OpposedTest} from "./tests/OpposedTest";
import {PhysicalResistTest} from "./tests/PhysicalResistTest";
import {handleRenderChatMessage} from "./chat";
import {MeleeAttackTest} from "./tests/MeleeAttackTest";
import {SpellCastingTest} from "./tests/SpellCastingTest";
import {DrainTest} from "./tests/DrainTest";
import {TestCreator} from "./tests/TestCreator";
import {CombatSpellDefenseTest} from "./tests/CombatSpellDefenseTest";
import ShadowrunItemDataData = Shadowrun.ShadowrunItemDataData;
import SocketMessageHooks = Shadowrun.SocketMessageHooks;
import SocketMessage = Shadowrun.SocketMessageData;
import {ComplexFormTest} from "./tests/ComplexFormTest";
import {AttributeOnlyTest} from "./tests/AttributeOnlyTest";
import {NaturalRecoveryStunTest} from "./tests/NaturalRecoveryStunTest";
import {NaturalRecoveryPhysicalTest} from "./tests/NaturalRecoveryPhysicalTest";
import {FadeTest} from "./tests/FadeTest";
import {ThrownAttackTest} from "./tests/ThrownAttackTest";
import {PilotVehicleTest} from "./tests/PilotVehicleTest";
import {DronePerceptionTest} from "./tests/DronePerceptionTest";
import {DroneInfiltrationTest} from "./tests/DroneInfiltrationTest";
import { SupressionDefenseTest } from './tests/SupressionDefenseTest';

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
        // Hooks.on('renderChatMessage', chat.addRollListeners)
        // Hooks.on('getChatLogEntryContext', chat.addChatMessageContextOptions);
        Hooks.on('hotbarDrop', HooksManager.hotbarDrop);
        Hooks.on('renderSceneControls', HooksManager.renderSceneControls);
        Hooks.on('getSceneControlButtons', HooksManager.getSceneControlButtons);
        Hooks.on('getCombatTrackerEntryContext', SR5Combat.addCombatTrackerContextOptions);
        Hooks.on('renderItemDirectory', HooksManager.renderItemDirectory);
        Hooks.on('renderTokenHUD', EnvModifiersApplication.addTokenHUDFields);
        Hooks.on('updateItem', HooksManager.updateIcConnectedToHostItem);
        Hooks.on('deleteItem', HooksManager.removeDeletedItemsFromNetworks);
        Hooks.on('getChatLogEntryContext', SuccessTest.chatMessageContextOptions);

        Hooks.on("renderChatLog", HooksManager.chatLogListeners);
        // Hooks.on("renderChatPopout", chatMessageListeners);
        Hooks.on('preUpdateCombatant', SR5Combat.onPreUpdateCombatant);

        Hooks.on('init', quenchRegister);
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
            /**
             * System level Document implementations.
             */
            SR5Actor,
            SR5Item,
            SR5ActiveEffect,
            /**
             * Macro hooks used when something's dropped onto the hotbar.
             */
            rollItemMacro,
            rollSkillMacro,
            /**
             * Complex test support (legacy).
             */
            ShadowrunRoller,
            /**
             * Should you only really need dice handling, use this. If you need more complex testing behaviour,
             * check the Test implementations.
             */
            SR5Roll,

            /**
             * You want to create a test from whatever source?
             * Use this.
             */
            test: TestCreator,

            /**
             * .tests define what test implementation to use for each test type (key).
             * Should you want to override default behaviour for SuccessTest types, overwrite
             * the SuccessTest class reference here
             */
            tests: {
                SuccessTest,
                OpposedTest,
                MeleeAttackTest,
                RangedAttackTest,
                ThrownAttackTest,
                PhysicalDefenseTest,
                SupressionDefenseTest,
                PhysicalResistTest,
                SpellCastingTest,
                CombatSpellDefenseTest,
                DrainTest,
                FadeTest,
                ComplexFormTest,
                AttributeOnlyTest,
                NaturalRecoveryStunTest,
                NaturalRecoveryPhysicalTest,
                PilotVehicleTest,
                DronePerceptionTest,
                DroneInfiltrationTest
            },
            /**
             * Subset of tests meant to be used as the main, active test.
             *
             * These will show up on actions when defining the main test to be used.
             */
            activeTests: {
                SuccessTest,
                MeleeAttackTest,
                RangedAttackTest,
                ThrownAttackTest,
                PhysicalResistTest,
                SupressionDefenseTest,
                SpellCastingTest,
                ComplexFormTest,
                PhysicalDefenseTest,
                NaturalRecoveryStunTest,
                NaturalRecoveryPhysicalTest,
                DrainTest,
                FadeTest,
                PilotVehicleTest,
                DronePerceptionTest,
                DroneInfiltrationTest
            },
            /**
             * Subset of tests meant to be used as opposed tests.
             *
             * These will show up on actions when defining an opposed test.
             */
            opposedTests: {
                OpposedTest,
                PhysicalDefenseTest,
                SupressionDefenseTest,
                CombatSpellDefenseTest
            },
            /**
             * Subset of tests meant to be used as resist tests.
             *
             * Instead of showing on the action configuration these are connected to active or opposed test.
             */
            resistTests: {
                PhysicalResistTest
            },
            /**
             * Subset of tests meant to follow a main active test
             */
            followedTests: {
                DrainTest,
                FadeTest
            },

            /**
             * Amount of delay used on user filter inputs.
             * This came out of an unclear user issue regarding multi-char UTF symbol inputs, to allow
             * 'interactive' changing of the delay on the user side until a sweetspot could be found.
             */
            inputDelay: 300
        };

        // Register document classes
        CONFIG.Actor.documentClass = SR5Actor;
        CONFIG.Item.documentClass = SR5Item;
        CONFIG.Combat.documentClass = SR5Combat;
        //@ts-ignore // TODO: foundry-vtt-types v10
        CONFIG.ActiveEffect.documentClass = SR5ActiveEffect;
        // Register object classes
        CONFIG.Token.objectClass = SR5Token;

        // Register initiative directly (outside of system.json) as DnD5e does it.
        CONFIG.Combat.initiative.formula =  "@initiative.current.base.value[Base] + @initiative.current.dice.text[Dice] - @wounds.value[Wounds]";
        // @ts-ignore
        Combatant.prototype._getInitiativeFormula = _combatantGetInitiativeFormula;

        // Register general SR5Roll for JSON serialization support.
        CONFIG.Dice.rolls.push(SR5Roll);
        // @ts-ignore // Register the SR5Roll dnd5e style.
        CONFIG.Dice.SR5oll = SR5Roll;

        // Add Shadowrun configuration onto general Foundry config for module access.
        // @ts-ignore // TODO: Add declaration merging
        CONFIG.SR5 = SR5;


        registerSystemSettings();

        // Register sheets for collection documents.
        // NOTE: See dnd5e for a multi class approach for all actor types using the types array in Actors.registerSheet
        Actors.unregisterSheet('core', ActorSheet);
        Actors.registerSheet(SYSTEM_NAME, SR5CharacterSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['critter', 'character']
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
        Actors.registerSheet(SYSTEM_NAME, SR5SpiritActorSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['spirit']
        });
        Actors.registerSheet(SYSTEM_NAME, SR5SpriteActorSheet, {
            label: "SR5.SheetActor",
            makeDefault: true,
            types: ['sprite']
        });


        Items.unregisterSheet('core', ItemSheet);
        Items.registerSheet(SYSTEM_NAME, SR5ItemSheet, {
            label: "SR5.SheetItem",
            makeDefault: true
        });

        // Register configs for embedded documents.
        DocumentSheetConfig.unregisterSheet(ActiveEffect, 'core', ActiveEffectConfig);
        DocumentSheetConfig.registerSheet(ActiveEffect, SYSTEM_NAME, SR5ActiveEffectConfig, {
            makeDefault: true
        })

        // Preload might reduce loading time during play.
        HandlebarManager.loadTemplates();
    }

    static async ready() {
        if (game.user?.isGM) {
            // Prohibit migration on empty worlds...
            if (Migrator.isEmptyWorld) {
                await Migrator.InitWorldForMigration();
                return;
            }
            
            // On populated worlds, try migrating
            await Migrator.BeginMigration();

            if (ChangelogApplication.showApplication) {
                await new ChangelogApplication().render(true);
            }
        }

        // Connect chat dice icon to shadowrun basic success test roll.
        const diceIconSelector = '#chat-controls .roll-type-select .fa-dice-d20';
        $(document).on('click', diceIconSelector, async () => await ShadowrunRoller.promptSuccessTest());
        const diceIconSelectorNew = '#chat-controls .chat-control-icon .fa-dice-d20';
        $(document).on('click', diceIconSelectorNew, async () => await ShadowrunRoller.promptSuccessTest());

        Hooks.on('renderChatMessage', HooksManager.chatMessageListeners);
        HooksManager.registerSocketListeners();
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

    /**
     * Register renderChatMessage Hooks using FoundryVTT Hooks.on for each registered test type.
     *
     * This will avoid calling the same method on different types twice.
     *
     * Must be called on 'ready' or after game.shadowrun is registered.
     */
    static renderChatMessage() {
        console.debug('Shadowrun5e | Registering new chat messages related hooks');
    }

    static renderItemDirectory(app: Application, html: JQuery) {
        const button = $('<button class="sr5 flex0">Import Chummer Data</button>');
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
                // @ts-ignore // TODO: foundry-vtt-types v10
                ...canvas.scene.tokens.filter(token => !token.actorLink && token.actor?.isIC() && token.actor?.hasHost()).map(t => t.actor)
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

    static async chatMessageListeners(message: ChatMessage, html, data) {
        await SuccessTest.chatMessageListeners(message, html, data);
        await OpposedTest.chatMessageListeners(message, html, data);
    }

    static async chatLogListeners(chatLog: ChatLog, html, data) {
        await SuccessTest.chatLogListeners(chatLog, html, data);
        await OpposedTest.chatLogListeners(chatLog, html, data);
    }

}
