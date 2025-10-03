import { Helpers } from '../../../helpers';
import { SR5 } from "../../../config";
import { AttributesPrep } from "./AttributesPrep";
import { SR5Item } from 'src/module/item/SR5Item';
import { DataDefaults } from '@/module/data/DataDefaults';

export class MatrixPrep {
    /**
     * Prepare Matrix data on the actor
     * - if an item is equipped, it will use that data
     * - if it isn't and player is technomancer, it will use that data
     */
    static prepareMatrix(system: Actor.SystemOfType<'character' | 'critter'>, items: SR5Item[]) {
        const { matrix, attributes, modifiers } = system;

        const MatrixList = ['firewall', 'sleaze', 'data_processing', 'attack'] as const;

        // clear matrix data to defaults
        for (const key of MatrixList) {
            matrix[key].base = 0;
            Helpers.addChange(matrix[key], { name: "SR5.Temporary", value: matrix[key].temp });
            Helpers.calcTotal(matrix[key]);
        }

        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';
        matrix.condition_monitor.label = 'SR5.ConditionMonitor';

        // get the first equipped device, we don't care if they have more equipped -- it shouldn't happen
        const device = items.find((item) => item.isEquipped() && item.isType('device')) as SR5Item<'device'>;

        if (device && !device.isLivingPersona()) {
            matrix.device = device._id!;

            const conditionMonitor = device.getConditionMonitor();

            matrix.condition_monitor.max = conditionMonitor.max + modifiers.matrix_track;
            matrix.condition_monitor.value = conditionMonitor.value;
            matrix.rating = device.getRating();
            matrix.is_cyberdeck = device.system.category === 'cyberdeck';
            matrix.name = device.name;
            matrix.item = device.system;
            matrix.running_silent = device.isRunningSilent();
            const deviceAtts = device.getASDF();
            // setup the actual matrix attributes for the actor
            for (const [key, value] of Object.entries(deviceAtts)) {
                if (!value) continue;
                // create a new attribute field from the current one, this also works if the matrix[key] field doesn't exist
                const att = DataDefaults.createData('attribute_field', matrix[key]);
                att.base = value.value;
                att['device_att'] = value.device_att;
                matrix[key] = att;
            }
        } // if we don't have a device, use living persona
        else if (system.special === 'resonance') {
            matrix.firewall.base = Helpers.calcTotal(attributes.willpower);
            matrix.data_processing.base = Helpers.calcTotal(attributes.logic);
            matrix.rating = Helpers.calcTotal(attributes.resonance);
            matrix.attack.base = Helpers.calcTotal(attributes.charisma);
            matrix.sleaze.base = Helpers.calcTotal(attributes.intuition);
            // if we have a Living Persona device, we want to use some of its data to make the sheet sync up best
            if (device && device.isLivingPersona()) {
                matrix.device = device._id!;
                // use the living persona item to determine if we are running silent
                matrix.running_silent = device.isRunningSilent();
                // use the name of the item rather than a localization of ours, allows for more customization
                matrix.name = device.name;
            } else {
                // if we didn't have a Living Persona device, set the name to Living Persona as a basic thing
                matrix.name = game.i18n.localize('SR5.LivingPersona');
            }
        }

        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
            matrix.condition_monitor.value = matrix.condition_monitor.max;
        }

        // Add Rating as an Attribute Field to the actor's Attributes
        // this should only happen for character's and critters
        const ratingAtt = DataDefaults.createData('attribute_field', { base: matrix.rating, hidden: true, });
        AttributesPrep.prepareAttribute('rating', ratingAtt);
        attributes['rating'] = ratingAtt;
    }

    /**
     * Add Matrix Attributes to Limits and Attributes
     * @param system
     */
    static prepareMatrixToLimitsAndAttributes(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'sprite' | 'vehicle'>) {
        const { matrix, attributes, limits } = system;

        // add matrix attributes to both limits and attributes as hidden entries
        for (const attributeName of Object.keys(SR5.matrixAttributes) as (keyof typeof SR5.matrixAttributes)[]) {
            const attribute = matrix[attributeName];

            AttributesPrep.prepareAttribute(attributeName, attribute);
            const { value, base, mod, label } = attribute;

            // Each matrix attribute also functions as a limit.
            limits[attributeName] = {
                ...limits[attributeName],
                ...{ value, base, mod, label, hidden: true }
            };

            // Copy matrix attribute data into attributes for ease of access during testing.
            attributes[attributeName] = {
                ...attributes[attributeName],
                ...{ value, base, mod, label, hidden: true }
            };
        }
    }

    static prepareMatrixAttributesForDevice(system: Actor.SystemOfType<'vehicle'>, rating?: number) {
        const { matrix } = system;
        rating = rating ?? matrix.rating;
        const matrixAttributes = ['firewall', 'data_processing'] as const;
        matrixAttributes.forEach((attribute) => {
            matrix[attribute].base = rating;
        });
        [...matrixAttributes, 'sleaze', 'attack'].forEach((attId) => {
            Helpers.calcTotal(matrix[attId]);
        });
    }
}
