import SR5ActorData = Shadowrun.SR5ActorData;
import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';
import {SR} from "../../../constants";
import AttributeField = Shadowrun.AttributeField;
import {SR5} from "../../../config";

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(data: SR5ActorData) {
        const { attributes } = data;

        // always have special attributes set to hidden
        attributes.magic.hidden = true;
        attributes.resonance.hidden = true;
        attributes.edge.hidden = true;
        attributes.essence.hidden = true;

        // set the value for the attributes
        for (let [key, attribute] of Object.entries(attributes)) {
            // don't manage the attribute if it is using the old method of edge tracking
            // needed to be able to migrate things correctly
            if (key === 'edge' && attribute['uses'] === undefined) return;
            AttributesPrep.prepareAttribute(key, attribute);
        }
    }

    static prepareAttribute(id: string, attribute: AttributeField) {
        if (!SR5.attributes.hasOwnProperty(id) || !attribute) return;

        // NOTE: This is legacy code I suspect does nothing. Disabled on 0.7.15. Delete it on any newer version!
        // const parts = new PartsList(attribute.mod);
        // attribute.mod = parts.list;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        const range = SR.attributes.ranges[id];
        Helpers.calcTotal(attribute, range);

        // add i18n labels.
        attribute.label = SR5.attributes[id];
    }
}
