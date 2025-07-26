/**
 * The constants file is a bit of a mess of stuff that doesn't change and some shadowrun specific rule values.
 * Everything should be reused by someplace else. Try to avoid any magic values withing your code.
 *
 * The SR object contains initial values and constants. Constants are written in ALL_CAPS_CONSTANTS and should never be
 * changed during runtime.
 * Regarding Shadowrun modifier values: If the rules define a negative modifier, declare it here as such. Don't use a positive
 * modifier and subtract at the place of use.
 *
 * Other than this file config.ts exists and only contains mappings between fixed names/ids and translation labels.
 *
 */
export const SYSTEM_NAME = 'shadowrun5e';
export const SYSTEM_SOCKET = `system.${SYSTEM_NAME}`;
export const FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    OnlyAllowRollOnDefaultableSkills: 'onlyAllowRollOnDefaultableSkills',
    ShowSkillsWithDetails: 'showSkillsWithDetails',
    OnlyAutoRollNPCInCombat: 'onlyAutoRollNPCInCombat',
    MessageCustomRoll: 'customRoll',
    ApplyLimits: 'applyLimits',
    LastRollPromptValue: 'lastRollPromptValue',
    DisplayDefaultRollCard: 'displayDefaultRollCard',
    CombatInitiativePass: 'combatInitiativePass',
    EmbeddedItems: 'embeddedItems',
    LastFireMode: 'lastFireMode',
    LastSpellForce: 'lastSpellForce',
    LastComplexFormLevel: 'lastComplexFormLevel',
    LastFireRange: 'lastFireRange',
    Attack: 'attack',
    Roll: 'roll',
    ActionTestData: 'actionTestData',
    TargetsSceneTokenIds: 'targetsSceneTokenIds',
    ChangelogShownForVersion: 'changelogShownForVersion',
    Modifier: 'modifier',
    DoInitPass: 'doInitPass',
    DoNextRound: 'doNextRound',
    DoNewActionPhase: 'doNewActionPhase',
    addNetworkController: 'addNetworkController',
    SetDataStorage: 'setDataStorage',
    TokenHealthBars: 'tokenHealthBars',
    Test: 'TestData',
    HideGMOnlyChatContent: 'HideGMOnlyChatContent',
    MustHaveRessourcesOnTest: 'MustConsumeRessourcesOnTest',
    AutomateMultiDefenseModifier: 'AutomateMultiDefenseModifier',
    AutomateProgressiveRecoil: 'AutomateProgressiveRecoil',
    TurnsSinceLastAttack: 'turnsSinceLastAttack',
    ManualRollOnSuccessTest: 'ManualRollOnSuccessTest',
    MarkImports: 'MarkImports',
    ImportIconFolder: 'ImportIconFolder',
    UseImportIconOverrides: 'UseImportIconOverrides',
    CreateTargetedEffects: 'CreateTargetedEffects',
    DefaultOpposedTestActorSelection: 'DefaultOpposedTestActorSelection',
    TeamworkTestFlow: 'TeamworkTestFlow',
    UseDamageCondition: 'UseDamageCondition',
    GlobalDataStorage: 'GlobalDataStorage',
    TokenRulerColorWalking: "TokenRulerColorWalking",
    TokenRulerColorRunning: "TokenRulerColorRunning",
    TokenRulerColorSprinting: "TokenRulerColorSprinting",
    TokenRulerOpacity: 'TokenRulerOpacity',
    TokenUseRoutingLib: 'TokenUseRoutingLib',
    RollMacroDefaultPack: "RollMacroDefaultPack",
    RollActionDefaultPack: "RollActionDefaultPack"
};
export const CORE_NAME = 'core';
export const CORE_FLAGS = {
    RollMode: 'rollMode'
}
export const METATYPEMODIFIER = 'SR5.Character.Modifiers.NPCMetatypeAttribute';

export const LENGTH_UNIT_TO_METERS_MULTIPLIERS = {
    'm': 1,
    'meter': 1,
    'meters': 1,
    'km': 1000,
    'kilometers': 1000,
    'kilometer': 1000,
};

export const DEFAULT_ROLL_NAME = 'Roll';
export const LENGTH_UNIT = 'm';
export const SKILL_DEFAULT_NAME = '';
export const DEFAULT_ID_LENGTH = 16;

// Contain data regarding shadowrun rules, mostly whatever is stated in some table to be looked up in other places.
export const SR = {
    combat: {
        // Modifiers to use for the different levels / ranges for environmental modifiers.
        environmental: {
            range_modifiers: {
                short: 0,
                medium: -1,
                long: -3,
                extreme: -6,
                // A modifier of zero will allow for users/gm to still test for targets with their own judgement.
                out_of_range: 0
            },
            levels: {
                good: 0,
                light: -1,
                moderate: -3,
                heavy: -6,
                extreme: -10,
            }
        },

        INI_RESULT_MOD_AFTER_INI_PASS: -10,
        INITIAL_INI_PASS: 1,
        INITIAL_INI_ROUND: 1
    },
    die: {
        glitch: [1],
        success: [5, 6]
    },
    defense: {
        spell: {
            direct: {
                mana: 'willpower',
                physical: 'body'
            }
        }
    },
    attributes: {
        // Use for min/max value ranges (general). This will need expanding for different metatypes, should that ever
        // come to  be.
        // These are the most extreme outer, possible modified values for each attribute.
        ranges: {
            magic: { min: 0 },
            edge: { min: 0 },
            resonance: { min: 0 },
            essence: { min: 0 },
            body: { min: 0 },
            agility: { min: 0 },
            reaction: { min: 0 },
            strength: { min: 0 },
            willpower: { min: 0 },
            logic: { min: 0 },
            intuition: { min: 0 },
            charisma: { min: 0 },
            attack: { min: 0 },
            sleaze: { min: 0 },
            data_processing: { min: 0 },
            firewall: { min: 0 },
            host_rating: { min: 0, max: 12 },
            pilot: { min: 0 },
            force: {min: 0}
        },
        /**
         * Spirits on creation can have calculated attributes that would lower them to 0 or lower, but still have to have a min value of
         * 1 for each.
         */
        rangesSpirit: {
            magic: { min: 0 },
            edge: { min: 0 },
            essence: { min: 0 },
            body: { min: 1 },
            agility: { min: 1 },
            reaction: { min: 1 },
            strength: { min: 1 },
            willpower: { min: 1 },
            logic: { min: 1 },
            intuition: { min: 1 },
            charisma: { min: 1 },
            pilot: { min: 0 },
            force: {min: 1}
        },
        // Use for initial default values that aren't simply range.<>.min values.
        defaults: {
            essence: 6
        },
        // Reaction would be displayed as REA, when set to 3.
        SHORT_NAME_LENGTH: 3
    },
    /**
     * Instead of general attributes, these are the attribute ranges for specific actor types
     */
    actorTypeAttributes: {
        vehicle: {
            // These physical attributes don't really exist on a vehicle.
            // System does manage them in regards to GitHub issue #712
            strength: { min: 0 },
            agility: {min: 0}
        }
    },
    skill: {
        // @PDF SR5#130
        DEFAULTING_MODIFIER: -1,
        SPECIALIZATION_MODIFIER: 2
    },
    initiatives: {
        ic: {
            dice: 4
        },
        ranges: {
            base: { min: 0 },
            dice: {min: 0, max: 5}
        }
    },
    /**
     * Grunt related npc constant data.
     */
    grunt: {
        metatype_modifiers: {
            elf: {
                attributes: {
                    agility: +1,
                    charisma: +2,
                    edge: -1
                }
            },
            ork: {
                attributes: {
                    body: +3,
                    strength: +2,
                    logic: -1,
                    charisma: -1,
                    edge: -1
                }
            },
            troll: {
                attributes: {
                    body: +4,
                    agility: -1,
                    strength: +4,
                    logic: -1,
                    intuition: -1,
                    charisma: -2,
                    edge: -1,
                },
                general: {
                    armor: +1
                }
            },
            dwarf: {
                attributes: {
                    body: +2,
                    reaction: -1,
                    strength: +2,
                    willpower: +1,
                    edge: -1
                }
            }
        }
    },
    gradeModifiers: {
        standard: { essence: 1, avail: 0, cost: 1 },
        alpha: { essence: 0.8, avail: 2, cost: 1.2 },
        beta: { essence: 0.7, avail: 4, cost: 1.5 },
        delta: { essence: 0.5, avail: 8, cost: 2.5 },
        gamma: { essence: 0.4, avail: 12, cost: 5 },
        grey: { essence: 0.75, avail: 0, cost: 1.3 },
        used: { essence: 1.25, avail: -4, cost: 0.75 },
    }
}
