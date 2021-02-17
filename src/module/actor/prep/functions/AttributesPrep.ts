import SR5ActorData = Shadowrun.SR5ActorData;
import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';

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
            const parts = new PartsList(attribute.mod);

            attribute.mod = parts.list;
            // Don't modify attribute below one.
            // TODO: Use a SR5.Values.Attribute calculation to avoid duplication.
            Helpers.calcTotal(attribute, {min: 1});

            // add i18n labels.
            attribute.label = CONFIG.SR5.attributes[key];
        }
    }
}
