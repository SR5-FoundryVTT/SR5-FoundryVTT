import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';
import {SR} from "../../../constants";
import {SR5} from "../../../config";
import AttributeField = Shadowrun.AttributeField;
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class AttributesPrep {
    /**
     * Prepare actor data for attributes
     */
    static prepareAttributes(data: ActorTypesData) {
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

            AttributesPrep.prepareAttribute(name, attribute)
        }
    }

    /**
     * Prepare one single AttributeField
     * @param name The key field (and name) of the attribute given
     * @param attribute The AttributeField to prepare
     */
    static prepareAttribute(name: string, attribute: AttributeField) {
        if (!SR5.attributes.hasOwnProperty(id) || !attribute) return;

        // TODO: IC-ACTOR Check this NOTE
        // NOTE: This is legacy code I suspect does nothing. Disabled on 0.7.15. Delete it on any newer version!
        // const parts = new PartsList(attribute.mod);
        // attribute.mod = parts.list;

        // Each attribute can have a unique value range.
        // TODO:  Implement metatype attribute value ranges for character actors.
        AttributesPrep.calculateAttribute(name, attribute);

        // add i18n labels.
        attribute.label = SR5.attributes[id];
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
