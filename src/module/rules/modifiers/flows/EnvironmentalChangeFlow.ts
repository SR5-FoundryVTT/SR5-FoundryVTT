/**
 * These flows are used to apply environmental modifiers to a documents applied modifier selection before a total has ben calculated.
 * 
 * Each function is a handler for a specific change key and value, defined by the caller of these methods.
 * 
 * Each function handles rules from the SR5#165 Environmental Modifier Compenstation table.
 * 
 * TODO: Check rules on stacking of multiple environmental modifier compensations.
 */
import { SR } from "../../../constants";
import { EnvironmentalModifier } from "../EnvironmentalModifier";

/**
 * Apply Low Light Rules to light modifiers. See SR5#175
 * @param modifier 
 */
export const lowLightVision = (modifier: EnvironmentalModifier) => {
    console.debug('Shadowrun 5e | Applying Low Light Effect', modifier);

    if (!modifier.applied.active.light) return;
    if (modifier.applied.active.light >= -3) modifier.applied.active.light = 0;

    console.debug('Shadowrun 5e | Applied Low Light Effect', modifier);
}

/**
 * Apply Image Manification to range modifiers. See SR5#175
 * @param modifier 
 */
export const imageMagnification = (modifier: EnvironmentalModifier) => {
    console.debug('Shadowrun 5e | Applying Image Magnification Effect', modifier);

    if (!modifier.applied.active.range) return;    

    modifier.applied.active.range = _shiftUpByOneRow(modifier.applied.active.range);

    console.debug('Shadowrun 5e | Applied Image Magnification Effect', modifier);
}

/**
 * Apply Thermographic Vision to light modifiers. See SR5#175
 * @param modifier 
 */
export const thermographicVision = (modifier: EnvironmentalModifier) => {
    console.debug('Shadowrun 5e | Applying Thermographic Vision Effect', modifier);

    if (!modifier.applied.active.light) return;

    modifier.applied.active.light = _shiftUpByOneRow(modifier.applied.active.light);

    console.debug('Shadowrun 5e | Applied Thermographic Vision Effect', modifier);
}

/**
 * Apply Tracer Rounds to wind and range modifiers. See SR5#175
 * @param modifier 
 */
export const tracerRounds = (modifier: EnvironmentalModifier) => {
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