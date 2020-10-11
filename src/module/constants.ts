export const SYSTEM_NAME = 'shadowrun5e';
export const FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    MessageCustomRoll: 'customRoll'
};
export const GLITCH_DIE = 1;
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
    }
}
