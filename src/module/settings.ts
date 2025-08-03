// game settings for shadowrun 5e

import { VersionMigration } from './migrator/VersionMigration';
import { FLAGS, SYSTEM_NAME } from './constants';
import SR5CompendiaSettings from './settings/SR5CompendiaSettings';

export const registerSystemSettings = () => {
    /**
     * No actual setting.
     *
     * Instead this is used to store global data outside of FoundryVTT document storage.
     * See DataStorage.ts for more information.
     */
    game.settings.register(SYSTEM_NAME, FLAGS.GlobalDataStorage, {
        name: 'SETTINGS.GlobalDataStorageName',
        hint: 'SETTINGS.GlobalDataStorageDescription',
        scope: 'world',
        config: false,
        type: Object,
        default: {}
    });

    /**
     * Default limit behavior
     */
    game.settings.register(SYSTEM_NAME, 'applyLimits', {
        name: 'SETTINGS.ApplyLimitsName',
        hint: 'SETTINGS.ApplyLimitsDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    /**
     * Track system version upon which a migration was last applied
     */
    game.settings.register(SYSTEM_NAME, VersionMigration.KEY_DATA_VERSION, {
        name: 'System Data Version.',
        scope: 'world',
        config: false,
        type: String,
        default: '0',
    });

    game.settings.register(SYSTEM_NAME, FLAGS.ShowGlitchAnimation, {
        name: 'SETTINGS.ShowGlitchAnimationName',
        hint: 'SETTINGS.ShowGlitchAnimationDescription',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_NAME, FLAGS.ShowTokenNameForChatOutput, {
        name: 'SETTINGS.ShowTokenNameForChatOutputName',
        hint: 'SETTINGS.ShowTokenNameForChatOutputDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_NAME, FLAGS.OnlyAllowRollOnDefaultableSkills, {
        name: 'SETTINGS.OnlyAllowRollOnDefaultableSkills',
        hint: 'SETTINGS.OnlyAllowRollOnDefaultableSkillsDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_NAME, FLAGS.ShowSkillsWithDetails, {
        name: 'SETTINGS.ShowSkillsWithDetails',
        hint: 'SETTINGS.ShowSkillsWithDetailsDescription',
        scope: 'client',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_NAME, FLAGS.OnlyAutoRollNPCInCombat, {
        name: 'SETTINGS.OnlyAutoRollNPCInCombat',
        hint: 'SETTINGS.OnlyAutoRollNPCInCombatDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    game.settings.register(SYSTEM_NAME, FLAGS.TokenHealthBars, {
        name: 'SETTINGS.TokenHealthBars',
        hint: 'SETTINGS.TokenHealthBarsDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false,
    });

    /**
     * Control if GM triggered chat messages should hide critical message parts.
     *
     * These parts will only show to players that have appropriate permissions on the used
     * actor for testing.
     */
    game.settings.register(SYSTEM_NAME, FLAGS.HideGMOnlyChatContent, {
        name: 'SETTINGS.HideGMOnlyChatContent',
        hint: 'SETTINGS.HideGMOnlyChatContentDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    /**
     * Control Test behaviour and consumption of necessary ressources for it.
     *
     * When set to true tests will NOT roll should one ressource be missing.
     *
     * This can be used to prevent edge rules to be used, when an actor doesn't have edge
     * and other ressources.
     */
    game.settings.register(SYSTEM_NAME, FLAGS.MustHaveRessourcesOnTest, {
        name: 'SETTINGS.MustHaveRessourcesOnTest',
        hint: 'SETTINGS.MustHaveRessourcesOnTestDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: false
    });

    game.settings.register(SYSTEM_NAME, FLAGS.UseDamageCondition, {
        name: 'SETTINGS.UseDamageConditionName',
        hint: 'SETTINGS.UseDamageConditionDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true,
    });

    /**
     * Control automation of creating the defense modification after mulitple attacks
     * on an actor unti their next action phase.
     *
     * See SR5.189 'Defender has defended against previous attacks'
     */
    game.settings.register(SYSTEM_NAME, FLAGS.AutomateMultiDefenseModifier, {
        name: 'SETTINGS.AutomateMultiDefenseModifier',
        hint: 'SETTINGS.AutomateMultiDefenseModifierDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    /**
     * Control automation of progressive recoil when continuously firing
     *
     * See SR5.175 'Progressive Recoil'
     */
    game.settings.register(SYSTEM_NAME, FLAGS.AutomateProgressiveRecoil, {
        name: 'SETTINGS.AutomateProgressiveRecoil',
        hint: 'SETTINGS.AutomateProgressiveRecoilDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    /**
     * Control automatic or manual casting of dice in any success test.
     */
    game.settings.register(SYSTEM_NAME, FLAGS.ManualRollOnSuccessTest, {
        name: 'SETTINGS.ManualRollOnSuccessTest',
        hint: 'SETTINGS.ManualRollOnSuccessTestDescription',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    });

    /**
     * Control default behavior for opposed test actors
     */
    game.settings.register(SYSTEM_NAME, FLAGS.DefaultOpposedTestActorSelection, {
        name: 'SETTINGS.DefaultOpposedTestActorSelection',
        hint: 'SETTINGS.DefaultOpposedTestActorSelectionDescription',
        scope: 'client',
        config: true,
        type: Boolean,
        default: false
    });

    /**
     * Determines whether freshly imported items should be marked with an icon and/or modified text color
     */
    game.settings.register(SYSTEM_NAME, FLAGS.MarkImports, {
        name: 'SETTINGS.MarkImportsName',
        hint: 'SETTINGS.MarkImportsDescription',
        scope: 'client',
        config: true,
        type: String,
        default: 'BOTH',
        // @ts-expect-error TODO: foundry-vtt-types v10
        choices: {
            'BOTH': 'SETTINGS.FreshColorAndIcon',
            'COLOR': 'SETTINGS.FreshColor',
            'ICON': 'SETTINGS.FreshIcon',
            'NONE': 'SETTINGS.NoMarking'
        }
    });

    /**
     * Sets the default importer icon folder
     */
    game.settings.register(SYSTEM_NAME, FLAGS.ImportIconFolder, {
        name: 'SETTINGS.ImportIconFolderName',
        hint: 'SETTINGS.ImportIconFolderDescription',
        scope: 'world',
        config: true,
        type: String,
        default: 'systems/shadowrun5e/dist/icons/importer/'
    });

    /**
     * Use the default icon overrides setting
     */
    game.settings.register(SYSTEM_NAME, FLAGS.UseImportIconOverrides, {
        name: 'SETTINGS.UseImportIconOverridesName',
        hint: 'SETTINGS.UseImportIconOverridesDescription',
        scope: 'world',
        config: true,
        type: Boolean,
        default: true
    });

    /**
     * TokenRuler color: Walking
     */
    game.settings.register(SYSTEM_NAME, FLAGS.TokenRulerColorWalking, {
        name: 'SETTINGS.TokenRulerColorWalking',
        hint: 'SETTINGS.TokenRulerColorWalkingDescription',
        scope: 'world',
        config: true,
        // @ts-expect-error not yet in typings
        type: new foundry.data.fields.ColorField({ initial: '00FF00' }),
    });

    /**
     * TokenRuler color: Running
     */
    game.settings.register(SYSTEM_NAME, FLAGS.TokenRulerColorRunning, {
        name: 'SETTINGS.TokenRulerColorRunning',
        hint: 'SETTINGS.TokenRulerColorRunningDescription',
        scope: 'world',
        config: true,
        // @ts-expect-error not yet in typings
        type: new foundry.data.fields.ColorField({ initial: '0000FF' }),
    });

    /**
     * TokenRuler color: Sprinting
     */
    game.settings.register(SYSTEM_NAME, FLAGS.TokenRulerColorSprinting, {
        name: 'SETTINGS.TokenRulerColorSprinting',
        hint: 'SETTINGS.TokenRulerColorSprintingDescription',
        scope: 'world',
        config: true,
        // @ts-expect-error not yet in typings
        type: new foundry.data.fields.ColorField({ initial: 'FF0000' }),
    });

    /**
     * TokenRuler color: Sprinting
     */
    game.settings.register(SYSTEM_NAME, FLAGS.TokenRulerOpacity, {
        name: 'SETTINGS.TokenRulerOpacity',
        hint: 'SETTINGS.TokenRulerOpacityDescription',
        scope: 'world',
        config: true,
        // @ts-expect-error not yet in typings
        type: new foundry.data.fields.AlphaField({ initial: 0.5 }),
    });

    /**
     * Select compendia to use for system porpuses like different action packs
     */
    game.settings.registerMenu(SYSTEM_NAME, FLAGS.CompendiaSettingsMenu, {
        name: 'SR5.CompendiaSettings.Title',
        hint: 'SR5.CompendiaSettings.Description',
        label: 'SR5.CompendiaSettings.Label',
        icon: 'fas fa-book',
        // @ts-expect-error TODO: foundry-vtt-types v13
        type: SR5CompendiaSettings,
        restricted: true, // Don't show to non GMs
    });

    /**
     * Override the default general actions pack
     */
    game.settings.register(SYSTEM_NAME, FLAGS.GeneralActionsPack, {
        name: 'SETTINGS.GeneralActionsPackName',
        hint: 'SETTINGS.GeneralActionsPackDescription',
        scope: 'world',
        config: false,
        type: String,
    });

    /**
     * Override the default matrix actions pack
     */
    game.settings.register(SYSTEM_NAME, FLAGS.MatrixActionsPack, {
        name: 'SETTINGS.MatrixActionsPackName',
        hint: 'SETTINGS.MatrixActionsPackDescription',
        scope: 'world',
        config: false,
        type: String
    });
};
