export const SYSTEM_NAME = 'shadowrun5e';
export const FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    MessageCustomRoll: 'customRoll'
};
export const GLITCH_DIE = 1;
export const METATYPEMODIFIER = 'SR5.Character.Modifiers.NPCMetatypeAttribute';

// TODO: Reduce duplication
export const LENGTH_UNIT_MULTIPLIERS = {
    meters: {
        'm': 1,
        'meter': 1,
        'meters': 1,
        'km': 1000,
        'kilometers': 1000,
        'kilometer': 1000,
    },
    feet: {
        'ft': 1,
        'feet': 1,
        'foot': 1,
        'mile': 5280,
        'miles': 5280,
        'mi': 5280
    }
}

// Contain data regarding shadowrun rules, mostly whatever is stated in some table to be looked up in other places.
export const SR = {
    combat: {
        environmental: {
            range_modifiers: {
                short: 0,
                medium: -1,
                long: -3,
                extreme: -6,
            }
        }
    }
}
