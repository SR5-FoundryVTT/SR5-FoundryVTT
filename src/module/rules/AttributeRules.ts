import { SR5Actor } from '@/module/actor/SR5Actor';
import { MinimalActionType } from '@/module/types/item/Action';
import { DataDefaults } from '@/module/data/DataDefaults';
import { AttributesType, TechnologyAttributesType } from '@/module/types/template/Attributes';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5 } from '@/module/config';

export class AttributeRules {

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param attributes The list of source attribute to pull from
     * @param rollData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    static injectAttributes(names: string[], attributes: AttributesType | TechnologyAttributesType, rollData: SR5Actor['system'], options: { bigger: boolean }) {
        const targetAttributes = rollData.attributes;
        for (const name of names) {
            // create a copy of the attribute data or make new attribute data if it wasn't found
            const sourceAttribute = DataDefaults.createData('attribute_field', attributes[name]);
            const targetAttribute = targetAttributes[name];

            if (options.bigger) {
                targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
            } else {
                targetAttributes[name] = sourceAttribute;
            }
        }
    }

    /**
     * Inject an actors mental attributes into an items test data.
     *
     * This case implements SR5#237 'Matrix Actions' devices owned by characters.
     * The special case 'a device is completely unattended' is ignored.
     *
     * @param actor Whatever actor to use for mental attributes
     * @param rollData TestData that will get modified in place
     */
    static injectMentalAttributes(actor: SR5Actor, rollData: SR5Item['system']) {
        if (!rollData.attributes) return;
        this.injectAttributes(SR5.mentalAttributes, actor.getAttributes(), rollData)
    }

    /**
     * Change physical attributes of the test to use their Mental Attribute
     * these are defined on SR5 pg #314 -- it is the Astral Attributes Table but I think it is shared across all things
     * @param action
     */
    static replacePhysicalAttributesWithMentalAttributes(action: MinimalActionType) {
        // check the attributes used by the action
        if (this.PhysicalToMentalAttributeMap.hasOwnProperty(action.attribute)) {
            action.attribute = this.PhysicalToMentalAttributeMap[action.attribute];
        }
        if (this.PhysicalToMentalAttributeMap.hasOwnProperty(action.attribute2)) {
            action.attribute2 = this.PhysicalToMentalAttributeMap[action.attribute2];
        }
    }

    static PhysicalToMentalAttributeMap = {
        'agility': 'logic',
        'body': 'willpower',
        'reaction': 'intuition',
        'strength': 'charisma',
    }
}
