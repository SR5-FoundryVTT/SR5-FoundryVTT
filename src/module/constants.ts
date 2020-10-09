export const SYSTEM_NAME = 'shadowrun5e';
export const FLAGS = {
    ShowGlitchAnimation: 'showGlitchAnimation',
    ShowTokenNameForChatOutput: 'showTokenNameInsteadOfActor',
    MessageCustomRoll: 'customRoll'
};
export const GLITCH_DIE = 1;
export const METATYPEMODIFIER = 'SR5.Character.Modifiers.NPCMetatypeAttribute';

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
