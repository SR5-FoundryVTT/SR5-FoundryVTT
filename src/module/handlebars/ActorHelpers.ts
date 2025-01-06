import { MonitorRules } from './../rules/MonitorRules';
import { SR5Item } from './../item/SR5Item';
import { SR5Actor } from './../actor/SR5Actor';
import ModificationCategoryType = Shadowrun.ModificationCategoryType;

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

    /** 
    * Determine the amount of Modification Category slots in use by a Vehicle actor, for the given Modification Category
    * 
    * @param items The items to be considered
    * @param modificationCategory The modification category 
    */
    Handlebars.registerHelper('calcModificationCategorySlots', (items: [SR5Item], modificationCategory: ModificationCategoryType): number => {
        if (!Array.isArray(items) || !items.length) { return 0 }
        const slotSum = items.reduce((arr, item) => {
            if (item.system.modification_category === modificationCategory) {
                arr += item.system.slots ? item.system.slots : 0;
                return arr;
            } else {
                return arr
            };
        }, 0)

        return slotSum;
    });

    /** 
    * Determine the amount of Modification slots available to a Vehicle actor from its Body attribute
    * 
    * @param actor The actor used to represent the vehicle
    */
        Handlebars.registerHelper('calcModificationSlotsAvailable', (actor: SR5Actor): number => {
            return actor.getAttributes().body.value | 0;
        });

    /** 
    * Determine the amount of Mod Points slots in use by a Vehicle actor (Drone)
    * 
    * @param items The items to be considered
    */
    Handlebars.registerHelper('calcModPointSlots', (items: [SR5Item]): number => {
        if (!Array.isArray(items) || !items.length) { return 0 }
        const dronestring = 'drone';
        const slotSum = items.reduce((arr, item) => {
            // @ts-expect-error Includes assumption all items have a type field, though I'm not familiar enough with this code to alter this assumption
            if (item.system.type === dronestring) { 
                arr += item.system.slots ? item.system.slots : 0 
                return arr;
            } else { 
                return arr 
            };
        }, 0)

        return slotSum;
    });


}
