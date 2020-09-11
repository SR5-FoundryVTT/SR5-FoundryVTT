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
            // this turns the Object model into the list mod
            if (typeof attribute.mod === 'object') {
                attribute.mod = new PartsList(attribute.mod).list;
            }
            const parts = new PartsList(attribute.mod);

            parts.addUniquePart('SR5.Temporary', attribute.temp ?? 0);
            // TODO legacy from previous sheet
            parts.removePart('Temporary');

            attribute.mod = parts.list;
            Helpers.calcTotal(attribute);
            // add labels
            attribute.label = CONFIG.SR5.attributes[key];
        }
    }
}
