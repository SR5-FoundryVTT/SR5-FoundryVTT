import { DataDefaults } from "../data/DataDefaults";
import { Helpers } from "../helpers";

/**
 * Rules around Compiling Sprites in SR5.
 */
export const CompilationRules = {
    /**
     * Determine the amount of fade value a technomancer has to resist against.
     * 
     * See SR5#254 'Compiling a sprite'
     * 
     * @param hitsSprite Amount of hits by the opposing sprite.
     * @returns The numerical drain value without damage type.
     */
    compilationFadeValue: (hitsSprite: number): number => {
        return Math.max(hitsSprite * 2, 2);
    },
    /**
     * Determine fade damage type according to SR5#254 'Compiling a sprite'.
     * @param level Sprite sprite level value.
     * @param resonance Resonance attribute value.
     * @returns damage type
     */
    calcFadeDamageType: (level: number, resonance: number): Shadowrun.DamageType => {
        if (level < 0) level = 0;
        if (resonance < 0) resonance = 1;

        return level > resonance ? 'physical' : 'stun';
    },
    /**
     * Determine the fade damage a technomancer has to resist against.
     * @param spriteHits Amount of hits by the opposing sprite.
     * @param level Sprite level used.
     * @param resonance Resonance attribute value.
     * @returns Configured fade damage
     */
    calcFadeDamage: (spriteHits: number, level: number, resonance: number): Shadowrun.DamageData => {
        if (spriteHits < 1) spriteHits = 0;
        if (resonance < 0) resonance = 1;

        const damage = DataDefaults.damageData();
        damage.base = CompilationRules.compilationFadeValue(spriteHits);
        damage.type.base = damage.type.value = CompilationRules.calcFadeDamageType(level, resonance);

        Helpers.calcTotal(damage, {min: 0});

        return damage;
    },
    /**
     * Determine if the chosen level is valid for the given resonance attribute.
     * 
     * See SR5#254 'Compiling a sprite'
     * 
     * @param level The level value.
     * @param resonance The resonance attribute value.
     */
    validLevel: (level: number, resonance: number): boolean => {
        if (level < 1) return false;
        return level <= resonance * 2;
    }
};