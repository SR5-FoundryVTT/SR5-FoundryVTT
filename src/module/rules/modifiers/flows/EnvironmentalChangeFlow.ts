import { SR } from "../../../constants";
import { EnvironmentalModifier } from "../EnvironmentalModifier";

/**
 * Apply Low Light Rules to light modifiers. See SR5#175
 * @param modifier 
 */
export const lowLight = (modifier: EnvironmentalModifier) => {
    console.debug('Shadowrun 5e | Applying Low Light Effect', modifier);

    if (!modifier.applied.active.light) return;
    if (modifier.applied.active.light >= -3) modifier.applied.active.light = 0;
}

/**
 * Apply Image Manification to range modifiers. See SR5#175
 * @param modifier 
 */
export const imageMagnification = (modifier: EnvironmentalModifier) => {
    console.debug('Shadowrun 5e | Applying Image Magnification Effect', modifier);

    if (!modifier.applied.active.range) return;    

    // Using all levels reduce active level by one.
    const levels = Object.values(SR.combat.environmental.levels);
    const active = levels.findIndex(level => level === modifier.applied.active.range);
    
    if (active === 0) return;
    if (active === -1) return console.error('Shadowrun 5e | Could not find matching active modifier level for Image Magnification Effect');
    
    modifier.applied.active.range = levels[active - 1];
}