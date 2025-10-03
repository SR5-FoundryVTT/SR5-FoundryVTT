import {InitiativePrep} from "./functions/InitiativePrep";
import {AttributesPrep} from "./functions/AttributesPrep";
import {SR5} from "../../config";
import {MatrixPrep} from "./functions/MatrixPrep";
import {DataDefaults} from "../../data/DataDefaults";
import {MatrixRules} from "../../rules/MatrixRules";
import {SkillsPrep} from "./functions/SkillsPrep";
import { SR5Item } from "src/module/item/SR5Item";
import { Helpers } from "@/module/helpers";
import { ModifiableFieldPrep } from './functions/ModifiableFieldPrep';


export class ICPrep {
    static prepareBaseData(system: Actor.SystemOfType<'ic'>) {
        ModifiableFieldPrep.resetAllModifiers(system);

        ICPrep.hideMeatAttributes(system);
        ICPrep.addHostAttributes(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'ic'>, items: SR5Item[]) {
        ICPrep.prepareMatrixAttributes(system);

        SkillsPrep.prepareSkills(system);

        ICPrep.prepareHostAttributes(system);
        ICPrep.prepareMeatAttributes(system);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(system);

        ICPrep.prepareMatrix(system);
        ICPrep.prepareMatrixTrack(system);

        ICPrep.prepareMatrixInit(system);
        InitiativePrep.prepareCurrentInitiative(system);
    }

    static prepareMatrix(system: Actor.SystemOfType<'ic'>) {
        system.matrix.rating = MatrixRules.getICDeviceRating(system.host.rating);
    }

    static prepareMatrixTrack(system: Actor.SystemOfType<'ic'>) {
        const { modifiers, track, matrix } = system;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = Number(modifiers['matrix_track']) + MatrixRules.getConditionMonitor(matrix.rating);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getConditionMonitor(matrix.rating);
        Helpers.addChange(track.matrix, { name: "SR5.Bonus", value: modifiers.matrix_track });
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'ic'>) {
        const { initiative, modifiers, host } = system;

        // Set current initiative to matrix
        initiative.perception = 'matrix';

        // Prepare used initiative parts
        initiative.matrix.base.base = MatrixRules.getICInitiativeBase(host.rating);
        Helpers.addChange(initiative.matrix.base, { name: "SR5.Bonus", value: modifiers.matrix_initiative });

        initiative.matrix.dice.base = MatrixRules.getICInitiativeDice();
        Helpers.addChange(initiative.matrix.dice, { name: "SR5.Bonus", value: modifiers.matrix_initiative_dice });
    }

    /**
     * For connected hosts overwrite matrix attributes with the hosts attributes, otherwise leave as is.
     */
    static prepareHostAttributes(system: Actor.SystemOfType<'ic'>) {
        if (!system.host.atts) return;

        Object.entries(system.host.atts).forEach(([deviceAttribute, attribute]) => {
            system.matrix[attribute.att].base = attribute.value;
            system.matrix[attribute.att].device_att = deviceAttribute;
        });
    }

    /**
     * Hide all meat attributes from display
     */
    static hideMeatAttributes(system: Actor.SystemOfType<'ic'>) {
        const { attributes } = system;

        for (const attribute of Object.values(attributes)) {
            attribute.hidden = true;
        }
    }

    /**
     * Add derived attributes based on host values.
     * 
     * As the rating attribute is only derived, it's not included in base data or template.json.
     */
    static addHostAttributes(system: Actor.SystemOfType<'ic'>) {
        system.attributes['rating'] = DataDefaults.createData('attribute_field', {label: 'SR5.Rating'});
    }

    static prepareMeatAttributes(system: Actor.SystemOfType<'ic'>) {
        const { attributes, host } = system;

        for (const id of Object.keys(SR5.attributes)) {
            if (!Object.hasOwn(attributes, id)) continue;
            // Exclude invalid attributes for IC
            if (['magic', 'edge', 'essence', 'resonance'].includes(id)) continue

            const attribute = attributes[id];

            // Overwrite the base as it's missing on new actors and IC should only derive it's meat attributes
            // from it's host attributes.
            attribute.base = 0;

            Helpers.addChange(attribute, { name: "SR5.Host.Rating", value: MatrixRules.getICMeatAttributeBase(host.rating) });

            AttributesPrep.prepareAttribute(id, attribute);
        }
    }

    /**
     * Calculate all matrix attributes without the meat attributes
     */
    static prepareMatrixAttributes(system: Actor.SystemOfType<'ic'>) {
        const { matrix } = system;

        for (const id of Object.keys(SR5.matrixAttributes)) {
            if (!Object.hasOwn(matrix, id)) continue;

            const attribute = matrix[id];
            AttributesPrep.prepareAttribute(id, attribute);
        }
    }
}
