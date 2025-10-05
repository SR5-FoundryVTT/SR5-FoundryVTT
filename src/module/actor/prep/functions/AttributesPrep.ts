import { SR5 } from '../../../config';
import { SR } from '../../../constants';
import { SR5Actor } from '../../SR5Actor';
import { Helpers } from '../../../helpers';
import { SR5Item } from 'src/module/item/SR5Item';
import { PartsList } from '@/module/parts/PartsList';
import { AttributeFieldType } from 'src/module/types/template/Attributes';

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(system: SR5Actor['system'], ranges?: Record<string, {min: number, max?: number}>) {
        const {attributes} = system;

        // always have special attributes set to hidden
        attributes.magic.hidden = true;
        attributes.resonance.hidden = true;
        attributes.edge.hidden = true;
        attributes.essence.hidden = true;

        // set the value for the attributes
        for (const [name, attribute] of Object.entries(attributes))
            AttributesPrep.prepareAttribute(name, attribute, ranges)
    }

    /**
     * Prepare one single AttributeField
     * @param name The key field (and name) of the attribute given
     * @param attribute The AttributeField to prepare
     */
    static prepareAttribute(name: string, attribute: AttributeFieldType, ranges?: Record<string, {min: number, max?: number}>) {
        // Check for valid attributes. Active Effects can cause unexpected properties to appear.
        if (!Object.hasOwn(SR5.attributes, name) || !attribute) return;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        AttributesPrep.calculateAttribute(name, attribute, ranges);

        // add i18n labels.
        attribute.label = SR5.attributes[name];
    }

    /**
     * Calculate a single attributes value with all it's ranges and rules applied.
     *
     * @param name The attributes name / id
     * @param attribute The attribute will be modified in place
     */
    static calculateAttribute(name: string, attribute: AttributeFieldType, ranges?: Record<string, {min: number, max?: number}>) {
        // Check for valid attributes. Active Effects can cause unexpected properties to appear.
        if (!Object.hasOwn(SR5.attributes, name) || !attribute) return;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        const range = ranges ? ranges[name] : SR.attributes.ranges[name];
        Helpers.calcTotal(attribute, range);
    }

    /**
     * Calculate the Essence attribute and it's modifiers.
     * 
     * @param system A system actor having an essence attribute
     * @param items The items that might cause an essence loss.
     */
    static prepareEssence(system: Actor.SystemOfType<'character' | 'critter'>, items: SR5Item[]) {
        // The essence base is fixed. Changes should be made through the attribute.temp field.
        system.attributes.essence.base = SR.attributes.defaults.essence;

        // Modify essence by actor modifer
        const parts = new PartsList(system.attributes.essence);

        const essenceMod = system.modifiers.essence;
        parts.addUniquePart('SR5.Bonus', essenceMod);

        for (const item of items) {
            if (item.isEquipped() && item.isType('bioware', 'cyberware'))
                parts.addPart(item.name, -item.getEssenceLoss());
        }

        Helpers.calcTotal(system.attributes.essence);
    }
}
