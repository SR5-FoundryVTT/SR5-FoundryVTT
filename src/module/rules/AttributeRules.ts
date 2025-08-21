import { SR5Actor } from '@/module/actor/SR5Actor';

export class AttributeRules {

    /**
     * Inject all attributes into testData that match the given attribute names list.
     *
     * Also implements the 'use bigger value rule',if necessary.
     *
     * @param names A list of attribute names to inject
     * @param attributes The list of source attribute to pull from
     * @param rollData The testData to inject attributes into
     * @param options
     * @param options.bigger If true, the bigger value will be used, if false the source value will always be used.
     */
    static _injectAttributes(names: string[], attributes: SR5Actor['system']['attributes'], rollData: SR5Actor['system'], options: { bigger: boolean }) {
        const targetAttributes = rollData.attributes;
        for (const name of names) {
            const sourceAttribute = foundry.utils.duplicate(attributes[name]);
            const targetAttribute = targetAttributes[name];

            if (options.bigger) {
                targetAttributes[name] = sourceAttribute.value > targetAttribute.value ? sourceAttribute : targetAttribute;
            } else {
                targetAttributes[name] = sourceAttribute;
            }
        }
    }

    /**
     * Override the mental attributes of the actor to their physical counterpart
     * @param rollData
     */
    static injectMentalAttributesToPhysicalAttributes(rollData: SR5Actor['system']) {
        const attributes = rollData.attributes;
        for (const [key, value] of Object.entries(this.PhysicalToMentalAttributeMap)) {
            const a1 = attributes[key];
            const a2 = attributes[value];

            // override the label and value
            // this doesn't actually change the "attribute used" exactly, but it appears to the user correctly
            a1.value = a2.value;
            a1.label = a2.label;
        }

    }

    static PhysicalToMentalAttributeMap = {
        'agility': 'logic',
        'body': 'willpower',
        'reaction': 'intuition',
        'strength': 'charisma',
    }
}
