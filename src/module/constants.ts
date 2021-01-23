export const SYSTEM_NAME = 'shadowrun5e';
export const FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    WhisperOpposedTestsToTargetedPlayers: 'whisperOpposedTestsToTargetedPlayers',
    MessageCustomRoll: 'customRoll',
    ApplyLimits: 'applyLimits',
    LastRollPromptValue: 'lastRollPromptValue',
    DisplayDefaultRollCard: 'displayDefaultRollCard',
    EmbeddedItems: 'embeddedItems',
    LastFireMode: 'lastFireMode',
    LastSpellForce: 'lastSpellForce',
    LastComplexFormLevel: 'lastComplexFormLevel',
    LastFireRange: 'lastFireRange',
    Attack: 'attack',
    Roll: 'roll'
};
export const CORE_NAME = 'core';
export const CORE_FLAGS = {
    RollMode: 'rollMode'
}
export const METATYPEMODIFIER = 'SR5.Character.Modifiers.NPCMetatypeAttribute';

// TODO: Reduce duplication
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
            }
        }
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
    }
}
