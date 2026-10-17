/**
 * These flows are used to apply environmental modifiers to a documents applied modifier selection before a total has ben calculated.
 * 
 * Each function is a handler for a specific change key and value, defined by the caller of these methods.
 * 
 * Each function handles rules from the SR5#175 Environmental Compensation table.
 * 
 * Vision systems don't stack, see applyBestVisionCompensation.
 */
import { SR } from "../../constants";
import { SuccessTest } from "../../tests/SuccessTest";
import { EnvironmentalModifier } from "../../rules/modifiers/EnvironmentalModifier";

type EnvironmentalChange = (modifier: EnvironmentalModifier, test?: SuccessTest) => void;

/** Change handlers of vision systems, which a character chooses between instead of stacking. */
export const VISION_COMPENSATIONS = new Set(['low_light_vision', 'thermographic_vision', 'ultrasound', 'flare_compensation', 'sunglasses']);
const VISION_CATEGORIES = ['light', 'glare', 'visibility'] as const;

/**
 * Apply Low Light Rules to light modifiers. It doesn't help against glare. See SR5#175
 * @param modifier 
 */
export const lowLightVision = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Low Light Effect', modifier);

    if (!modifier.applied.active.light) return;
    if (modifier.applied.active.light >= -3) modifier.applied.active.light = 0;

    console.debug('Shadowrun 5e | Applied Low Light Effect', modifier);
}

/**
 * Apply Image Magnification to range modifiers. See SR5#175
 * @param modifier 
 */
export const imageMagnification = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Image Magnification Effect', modifier);

    if (modifier.applied.active.range) modifier.applied.active.range = _shiftUpByOneRow(modifier.applied.active.range);

    console.debug('Shadowrun 5e | Applied Image Magnification Effect', modifier);
}

/**
 * Apply Thermographic Vision to light and visibility modifiers. See SR5#175
 * @param modifier 
 */
export const thermographicVision = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Thermographic Vision Effect', modifier);

    if (modifier.applied.active.light) modifier.applied.active.light = _shiftUpByOneRow(modifier.applied.active.light);
    if (modifier.applied.active.visibility) modifier.applied.active.visibility = _shiftUpByOneRow(modifier.applied.active.visibility);

    console.debug('Shadowrun 5e | Applied Thermographic Vision Effect', modifier);
}

/**
 * Apply Tracer Rounds to wind and range modifiers. See SR5#175
 * @param modifier 
 */
export const tracerRounds = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Tracer Rounds Effect', modifier);

    if (modifier.applied.active.wind && modifier.applied.active.wind < SR.combat.environmental.levels.light) {
        modifier.applied.active.wind = _shiftUpByOneRow(modifier.applied.active.wind);
    }

    if (modifier.applied.active.range && modifier.applied.active.range < SR.combat.environmental.levels.light) {
        modifier.applied.active.range = _shiftUpByOneRow(modifier.applied.active.range);
    }

    console.debug('Shadowrun 5e | Applied Tracer Rounds Effect', modifier);
}

/**
 * Apply Smartlink to wind modifiers. See SR5#175
 * @param modifier 
 */
export const smartlink = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Smartlink Effect', modifier);

    if (modifier.applied.active.wind) modifier.applied.active.wind = _shiftUpByOneRow(modifier.applied.active.wind);
    
}

/**
 * Apply Flare Compensation to glare modifiers. See SR5#175
 * @param modifier 
 */
export const flareCompensation = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    if (modifier.applied.active.glare) modifier.applied.active.glare = _shiftUpByOneRow(_shiftUpByOneRow(modifier.applied.active.glare));
}

/**
 * Apply Sunglasses to glare modifiers, making existing darkness worse. See SR5#175
 * @param modifier 
 */
export const sunglasses = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    if (modifier.applied.active.glare) modifier.applied.active.glare = _shiftUpByOneRow(modifier.applied.active.glare);
    if (modifier.applied.active.light) modifier.applied.active.light = _shiftDownByOneRow(modifier.applied.active.light);
}

/**
 * Apply the vision systems a character has, using the best result for each condition.
 *
 * Players choose which system to use for an action (SR5#174), so each system is applied to the same
 * conditions on its own. Otherwise thermographic and low-light vision would clear total darkness.
 */
export const applyBestVisionCompensation = (modifier: EnvironmentalModifier, changes: EnvironmentalChange[], test?: SuccessTest) => {
    const conditions = { ...modifier.applied.active };
    const best: Partial<Record<typeof VISION_CATEGORIES[number], number>> = {};

    for (const change of changes) {
        modifier.applied.active = { ...conditions };
        change(modifier, test);
        for (const category of VISION_CATEGORIES) {
            const value = modifier.applied.active[category];
            if (value !== undefined) best[category] = Math.max(best[category] ?? value, value);
        }
    }

    modifier.applied.active = { ...conditions, ...best };
}

export const ultrasound = (modifier: EnvironmentalModifier, test?: SuccessTest) => {
    console.debug('Shadowrun 5e | Applying Ultrasound Effect', modifier);

    if (modifier.applied.active.visibility) {
        modifier.applied.active.visibility = _shiftUpByOneRow(modifier.applied.active.visibility);
    }

    // NOTE: This only uses distance, which at the moment is only set for targeted actor distances.
    // TODO: When only the weapon range selection is used, no range distance is set.
    if (!test) return;
    const distance = test.data['distance'];
    if (!distance) return;

    // Ultrasound isn't optical, so neither light nor glare matter.
    if (Number(distance) <= 50) {
        modifier.applied.active.light = 0;
        modifier.applied.active.glare = 0;
    }
}

/**
 * Local helper method to shift environmental modifiers up by one row.
 * 
 * Row relates to the Environmental modifiers table. See SR5#175
 * 
 * @param active The active modifier level.
 * @returns A new modifier level. Zero, for faulty inputs.
 */
const _shiftUpByOneRow = (active: number): number => {
    // Using all levels reduce active level by one.
    const levels = Object.values(SR.combat.environmental.levels);
    const activeIndex = levels.findIndex(level => level === active);
    
    if (activeIndex === -1) {
        console.error('Shadowrun 5e | Could not find matching active modifier level');
        return 0;
    };

    if (active === 0) return 0;

    return levels[activeIndex - 1];
}

/**
 * Local helper method to shift environmental modifiers down by one row, at worst to the heavy row.
 * 
 * Row relates to the Environmental modifiers table. See SR5#175
 * 
 * @param active The active modifier level.
 * @returns A new modifier level.
 */
const _shiftDownByOneRow = (active: number): number => {
    const { light, moderate, heavy } = SR.combat.environmental.levels;
    const levels: number[] = [light, moderate, heavy];
    const activeIndex = levels.indexOf(active);
    if (activeIndex === -1) return active;
    return levels[Math.min(activeIndex + 1, levels.length - 1)];
}
