import { SR5Actor } from '@/module/actor/SR5Actor';
import { MinimalActionType } from '@/module/types/item/Action';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5 } from '@/module/config';

export class AttributeRules {

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param source The Actor or Item to use as the source of attributes
     * @param rollData The testData to inject attributes into
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    static injectAttributes(
        names: readonly string[],
        source: SR5Actor | SR5Item,
        rollData: SR5Actor['system'] | SR5Item['system'],
        options: { bigger: boolean }
    ) {
        const targetAttributes = rollData.attributes;
        if (targetAttributes) {
            for (const name of names) {
                // get the source attribute, but may be undefined
                let sourceAttribute = source.getAttribute(name);
                if (!sourceAttribute) continue;
                // if it is defined, duplicate it so we don't mess with the underlying data
                sourceAttribute = foundry.utils.deepClone(sourceAttribute);
                const targetAttribute = targetAttributes[name];

                if (options.bigger) {
                    targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
                } else {
                    targetAttributes[name] = sourceAttribute;
                }
            }
        } else {
            console.warn("Shadowrun5e | Could not find Attributes on provided Roll Data", rollData);
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
        this.injectAttributes(SR5.mentalAttributes, actor, rollData, { bigger: false });
    }

    /**
     * Change physical attributes of the test to use their Mental Attribute
     * these are defined on SR5 pg #314 -- it is the Astral Attributes Table but I think it is shared across all things
     * @param action
     */
    static replacePhysicalAttributesWithMentalAttributes(action: MinimalActionType) {
        // check the attributes used by the action
        if (Object.hasOwn(this.PhysicalToMentalAttributeMap, action.attribute)) {
            action.attribute = this.PhysicalToMentalAttributeMap[action.attribute];
        }
        if (Object.hasOwn(this.PhysicalToMentalAttributeMap, action.attribute2)) {
            action.attribute2 = this.PhysicalToMentalAttributeMap[action.attribute2];
        }
    }

    static PhysicalToMentalAttributeMap = {
        'agility': 'logic',
        'body': 'willpower',
        'reaction': 'intuition',
        'strength': 'charisma',
    } as const;
}
