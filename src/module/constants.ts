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
    WhisperOpposedTestsToTargetedPlayers: 'whisperOpposedTestsToTargetedPlayers',
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
    TargetsSceneTokenIds: 'targetsSceneTokenIds',
    ChangelogShownForVersion: 'changelogShownForVersion',
    Modifier: 'modifier',
    DoInitPass: 'doInitPass',
    DoNextRound: 'doNextRound',
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
        environmental: {
            range_modifiers: {
                short: 0,
                medium: -1,
                long: -3,
                extreme: -6,
                // A modifier of zero will allow for users/gm to still test oor targets with their own judgement.
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
        ranges: {
            magic: {min: 0},
            edge: {min: 0},
            resonance: {min: 0},
            essence: {min: 0},
            body: {min: 1},
            agility: {min: 1},
            reaction: {min: 1},
            strength: {min: 1},
            willpower: {min: 1},
            logic: {min: 1},
            intuition: {min: 1},
            charisma: {min: 1},
            attack: {min: 0},
            sleaze: {min: 0},
            data_processing: {min: 0},
            firewall: {min: 0}
        },
        SHORT_NAME_LENGTH: 3
    },
    skill: {
        // @PDF SR5#130
        DEFAULTING_MODIFIER: -1,
        SPECIALIZATION_MODIFIER: 2
    }
}
