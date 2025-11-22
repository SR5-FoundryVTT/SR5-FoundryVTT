import { MonitorRules } from './../rules/MonitorRules';
import { SR5Item } from './../item/SR5Item';
import { SR5Actor } from './../actor/SR5Actor';
import { SR5 } from '@/module/config';
import { MatrixAttributeFieldType } from '@/module/types/template/Matrix';
type ModificationCategoryType = Item.SystemOfType<'modification'>['modification_category'];

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
    Handlebars.registerHelper('calcModificationCategorySlots', (items: SR5Item<'modification'>[], modificationCategory: ModificationCategoryType): number => {
        if (!Array.isArray(items) || !items.length) { return 0 }        
        let slotSum = 0;
        
        for (const item of items) {
            if (item.system.modification_category === modificationCategory) {
                // If item's technology exists and quantity has been defined, use the item's quantity. Else use 1.
                const quantity = item.system.technology?.quantity || 1;
                slotSum += (item.system.slots || 0) * quantity;
            }
        }

        return slotSum;
    });

    /** 
    * Determine the amount of Modification slots available to a Vehicle actor from its Body attribute
    * 
    * @param actor The actor used to represent the vehicle
    */
    Handlebars.registerHelper('calcModificationSlotsAvailable', (actor: SR5Actor): number => {
        const body = actor.getAttribute("body");
        if (body === undefined)
            return 0;
        else
            return body.value;
    });

    /** 
    * Determine the amount of Mod Points slots in use by a Vehicle actor (Drone)
    * 
    * @param items The items to be considered
    */
    Handlebars.registerHelper('calcModPointSlots', (items: [SR5Item<'modification'>]): number => {
        if (!Array.isArray(items) || !items.length) { return 0 }
        const dronestring = 'drone';
        const slotSum = items.reduce((arr, item) => {
            if (item.system.type === dronestring) { 
                arr += item.system.slots ? item.system.slots : 0 
                return arr;
            } else {
                return arr;
            }
        }, 0);

        return slotSum;
    });

    Handlebars.registerHelper('matrixChoices', (item: SR5Item<'device'>['system'], matrixAtt: MatrixAttributeFieldType) => {
        const currentAtt = matrixAtt.device_att;
        const choices: {label: string, value: string}[] = [];
        let currentChoice: { label: string; value: string; } | undefined;
        for (const [key, att] of Object.entries(item.atts as Record<string, any>)) {
            if (key === currentAtt) {
                currentChoice = {
                    label: game.i18n.localize(SR5.matrixAttributes[att.att]),
                    value: key,
                };
            } else {
                choices.push({
                    label: `(${att.value}) ${game.i18n.localize(SR5.matrixAttributes[att.att])}`,
                    value: key,
                });
            }
        }
        if (currentChoice) {
            // keep the current option as the first to make it look better in the select
            // if someone knows how to hide it in the dropdown options, that would be ideal
            choices.unshift(currentChoice);
        }
        return choices;
    })

    Handlebars.registerHelper('inventoryCanRename', (inventory: string, options) => {
        const actor = options.data.root.actor as SR5Actor;
        return !actor.inventory.disallowRename(inventory);
    });

    Handlebars.registerHelper('inventoryCanRemove', (inventory: string, options) => {
        const actor = options.data.root.actor as SR5Actor;
        return !actor.inventory.disallowRemove(inventory);
    });
}
