import SR5ActorData = Shadowrun.SR5ActorData;
import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';
import {SR} from "../../../constants";
import {SR5} from "../../../config";
import AttributeField = Shadowrun.AttributeField;

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(data: SR5ActorData) {
        const {attributes} = data;

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

            const parts = new PartsList(attribute.mod);
            attribute.mod = parts.list;

            AttributesPrep.calculateAttribute(name, attribute);

            // add i18n labels.
            attribute.label = SR5.attributes[name];
        }
    }

    /**
     * Calculate a single attributes value with all it's ranges and rules applied.
     *
     * @param name The attributes name / id
     * @param attribute The attribute will be modified in place
     */
    static calculateAttribute(name: string, attribute: AttributeField) {
        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        const range = SR.attributes.ranges[name];
        Helpers.calcTotal(attribute, range);
    }
}
