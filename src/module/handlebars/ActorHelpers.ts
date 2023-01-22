import { MonitorRules } from './../rules/MonitorRules';
export const registerActorHelpers = () => {
    /** 
     * Determine if a wound modifier should be shown for a specific box on a damage track, including pain rules.
     * 
     * @param box The box to be treated as virutal damage
     * @param painTolerance Amount of boxes before given box to be ignored
     * @param woundBoxesThreshold Amount of boxes after pain tolerance used as a step size between shown wound modifiers.
     */
    Handlebars.registerHelper('showWoundModifier', (box: number, painTolerance: number, woundBoxesThreshold: number): boolean => {
        if (box <= painTolerance) return false;

        return (box - painTolerance) % woundBoxesThreshold === 0;
    });

    Handlebars.registerHelper('woundModifier', (box: number, painTolerance: number, woundBoxesThreshold: number): number => {
        const wounds = MonitorRules.wounds(box, woundBoxesThreshold, painTolerance);
        return MonitorRules.woundModifier(wounds);
    });
}