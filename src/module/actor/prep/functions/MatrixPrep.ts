import MatrixActorData = Shadowrun.MatrixActorData;
import { Helpers } from '../../../helpers';
import { SR5ItemDataWrapper } from '../../../data/SR5ItemDataWrapper';
import { PartsList } from '../../../parts/PartsList';
import {SR5} from "../../../config";
import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import ShadowrunActorDataData = Shadowrun.ShadowrunActorDataData;
import CommonData = Shadowrun.CommonData;
import {AttributesPrep} from "./AttributesPrep";
import localize from '../../../utils/strings';

export class MatrixPrep {
    /**
     * Prepare Matrix data on the actor
     * - if an item is equipped, it will use that data
     * - if it isn't and player is technomancer, it will use that data
     */
    static prepareMatrix(system: ActorTypesData & MatrixActorData, items: SR5ItemDataWrapper[]) {
        const { matrix, attributes, modifiers } = system;

        const MatrixList = ['firewall', 'sleaze', 'data_processing', 'attack'];

        // clear matrix data to defaults
        MatrixList.forEach((key) => {
            const parts = new PartsList(matrix[key].mod);
            if (matrix[key].temp) parts.addUniquePart('SR5.Temporary', matrix[key].temp);
            // LEGACY from when the sheet used 'mod.Temporary'
            parts.removePart('Temporary');
            matrix[key].mod = parts.list;
            matrix[key].value = parts.total;
        });
        matrix.condition_monitor.max = 0;
        matrix.rating = 0;
        matrix.name = '';
        matrix.device = '';
        matrix.condition_monitor.label = 'SR5.ConditionMonitor';

        // get the first equipped device, we don't care if they have more equipped -- it shouldn't happen
        const device = items.find((item) => item.isEquipped() && item.isDevice());

        if (device) {
            matrix.device = device.getId();

            const conditionMonitor = device.getConditionMonitor();

            matrix.condition_monitor.max = conditionMonitor.max + Number(modifiers.matrix_track);
            matrix.condition_monitor.value = conditionMonitor.value;
            matrix.rating = device.getRating();
            matrix.is_cyberdeck = device.isCyberdeck();
            matrix.name = device.getName();
            matrix.item = device.getData();
            const deviceAtts = device.getASDF();
            if (deviceAtts) {
                // setup the actual matrix attributes for the actor
                for (const [key, value] of Object.entries(deviceAtts)) {
                    if (value && matrix[key]) {
                        matrix[key].base = value.value;
                        matrix[key].device_att = value.device_att;
                    }
                }
            }
        } // if we don't have a device, use living persona
        else if (system.special === 'resonance') {
            matrix.firewall.base = Helpers.calcTotal(attributes.willpower);
            matrix.data_processing.base = Helpers.calcTotal(attributes.logic);
            matrix.rating = Helpers.calcTotal(attributes.resonance);
            matrix.attack.base = Helpers.calcTotal(attributes.charisma);
            matrix.sleaze.base = Helpers.calcTotal(attributes.intuition);
            matrix.name = localize('SR5.LivingPersona');
        }

        // set matrix condition monitor to max if greater than
        if (matrix.condition_monitor.value > matrix.condition_monitor.max) {
            matrix.condition_monitor.value = matrix.condition_monitor.max;
        }
    }

    /**
     * Add Matrix Attributes to Limits and Attributes
     * @param system
     */
    static prepareMatrixToLimitsAndAttributes(system: CommonData & MatrixActorData) {
        const { matrix, attributes, limits } = system;

        // add matrix attributes to both limits and attributes as hidden entries
        Object.keys(SR5.matrixAttributes).forEach((attributeName) => {
            if (!matrix.hasOwnProperty(attributeName)) {
                return console.error(`SR5Actor matrix preparation failed due to missing matrix attributes`);
            }

            const attribute = matrix[attributeName];
            // Helpers.calcTotal(matrix[attributeName]);
            // const label = SR5.matrixAttributes[attributeName];
            // const { value, base, mod } = matrix[attributeName];
            AttributesPrep.prepareAttribute(attributeName, attribute);
            const { value, base, mod, label } = attribute;
            const hidden = true;

            // Each matrix attribute also functions as a limit.
            limits[attributeName] = {
                value,
                base,
                mod,
                label,
                hidden,
            };

            // Copy matrix attribute data into attributes for ease of access during testing.
            attributes[attributeName] = {
                value,
                base,
                mod,
                label,
                hidden,
            };
        });
    }

    static prepareMentalAttributesForDevice(system: CommonData & MatrixActorData, rating?: number) {
        const { matrix, attributes } = system;
        rating = rating ?? matrix.rating;
        const mentalAttributes = ['intuition', 'logic', 'charisma', 'willpower'];

        mentalAttributes.forEach((attLabel) => {
            if (attributes[attLabel] !== undefined) {
                attributes[attLabel].base = rating ?? 0; // TypeScript got confused otherwise...
                Helpers.calcTotal(attributes[attLabel]);
            }
        });
    }

    static prepareMatrixAttributesForDevice(system: CommonData & MatrixActorData, rating?: number) {
        const { matrix } = system;
        rating = rating ?? matrix.rating;
        const matrixAttributes = ['firewall', 'data_processing'];
        matrixAttributes.forEach((attribute) => {
            matrix[attribute].base = rating;
        });
        [...matrixAttributes, 'sleaze', 'attack'].forEach((attId) => {
            Helpers.calcTotal(matrix[attId]);
        });
    }

    /**
     * Prepare the mental attributes for a sheet that just has a device rating
     * @param system
     */
    static prepareAttributesForDevice(system: CommonData & MatrixActorData, rating: number = 0) {
        MatrixPrep.prepareMentalAttributesForDevice(system, rating);
        MatrixPrep.prepareMatrixAttributesForDevice(system, rating);
    }
}
