import { Helpers } from '../../../helpers';
import {SR} from "../../../constants";
import {SR5} from "../../../config";
import { PartsList } from '../../../parts/PartsList';
import { SR5ItemDataWrapper } from '../../../data/SR5ItemDataWrapper';
import { ItemPrep } from './ItemPrep';
import { SystemActor } from '../../SR5Actor';
import { AttributeFieldType } from 'src/module/types/template/AttributesModel';
import { ModifiableValueType } from 'src/module/types/template/BaseModel';

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(system: Actor.SystemOfType<SystemActor>, ranges?: Record<string, {min: number, max?: number}>) {
        const {attributes} = system;

        // always have special attributes set to hidden
        attributes.magic.hidden = true;
        attributes.resonance.hidden = true;
        attributes.edge.hidden = true;
        attributes.essence.hidden = true;

        // set the value for the attributes
        for (let [name, attribute] of Object.entries(attributes)) {
            // don't manage the attribute if it is using the old method of edge tracking
            // needed to be able to migrate things correctly
            if (name === 'edge' && attribute['uses'] === undefined) return;

            AttributesPrep.prepareAttribute(name, attribute, ranges)
        }
    }

    /**
     * Prepare one single AttributeField
     * @param name The key field (and name) of the attribute given
     * @param attribute The AttributeField to prepare
     */
    static prepareAttribute(name: string, attribute: AttributeFieldType, ranges?: Record<string, {min: number, max?: number}>) {
        // Check for valid attributes. Active Effects can cause unexpected properties to appear.
        if (!SR5.attributes.hasOwnProperty(name) || !attribute) return;

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
        if (!SR5.attributes.hasOwnProperty(name) || !attribute) return;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        const range = ranges ? ranges[name] : SR.attributes.ranges[name];
        Helpers.calcTotal(attribute as ModifiableValueType, range);
    }

    /**
     * Calculate the Essence attribute and it's modifiers.
     * 
     * @param system A system actor having an essence attribute
     * @param items The items that might cause an essence loss.
     */
    static prepareEssence(system: Actor.SystemOfType<'character' | 'critter'>, items: SR5ItemDataWrapper[]) {
        // The essence base is fixed. Changes should be made through the attribute.temp field.
        system.attributes.essence.base = SR.attributes.defaults.essence;

        // Modify essence by actor modifer
        const parts = new PartsList<number>(system.attributes.essence.mod);

        const essenceMod = system.modifiers['essence'];
        if (essenceMod && !Number.isNaN(essenceMod)) {
            parts.addUniquePart('SR5.Bonus', Number(essenceMod));
        }

        system.attributes.essence.mod = parts.list;

        ItemPrep.prepareWareEssenceLoss(system, items);

        system.attributes.essence.value = Helpers.calcTotal(system.attributes.essence as ModifiableValueType);
    }
}
