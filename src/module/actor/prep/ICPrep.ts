import {ModifiersPrep} from "./functions/ModifiersPrep";
import {InitiativePrep} from "./functions/InitiativePrep";
import {AttributesPrep} from "./functions/AttributesPrep";
import {PartsList} from "../../parts/PartsList";
import {SR5} from "../../config";
import {MatrixPrep} from "./functions/MatrixPrep";
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";
import {DataDefaults} from "../../data/DataDefaults";
import {MatrixRules} from "../../rules/MatrixRules";
import DeviceAttribute = Shadowrun.DeviceAttribute;
import {SkillsPrep} from "./functions/SkillsPrep";


export class ICPrep {
    static prepareBaseData(system: Actor.SystemOfType<'ic'>) {
        ModifiersPrep.clearAttributeMods(system);
        ModifiersPrep.clearLimitMods(system);
        SkillsPrep.prepareSkillData(system);

        ICPrep.addMissingTracks(system);
        ICPrep.prepareModifiers(system);
        ICPrep.hideMeatAttributes(system);
        ICPrep.addHostAttributes(system);
    }

    static prepareDerivedData(system: Actor.SystemOfType<'ic'>, items: SR5ItemDataWrapper[]) {
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

    /**
     * On initial actor creation the matrix track will be missing.
     *
     * This is intentional as not to pollute template.json with actor type specific data.
     *
     */
    static addMissingTracks(system: Actor.SystemOfType<'ic'>) {
        // Newly created actors SHOULD have this by template.
        // Legacy actors MIGHT not have it, therefore make sure it's there.
        const track = system.track || {};

        if (!track.matrix) track.matrix = DataDefaults.createData('track');
        system.track = track;
    }

    /**
     * Add IC modifiers only to the misc tab.
     * @param system
     */
    static prepareModifiers(system: Actor.SystemOfType<'ic'>) {
        let modifiers = ModifiersPrep.commonModifiers as string[];
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers as string[]);
        ModifiersPrep.setupModifiers(system, modifiers);
    }

    static prepareMatrix(system: Actor.SystemOfType<'ic'>) {
        system.matrix.rating = MatrixRules.getICDeviceRating(system.host.rating);
    }

    static prepareMatrixTrack(system: Actor.SystemOfType<'ic'>) {
        const { modifiers, track, matrix } = system;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = Number(modifiers['matrix_track']) + MatrixRules.getConditionMonitor(matrix.rating as number);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getConditionMonitor(matrix.rating as number);
        track.matrix.mod = PartsList.AddUniquePart(track.matrix.mod, "SR5.Bonus", Number(modifiers['matrix_track']));
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMatrixInit(system: Actor.SystemOfType<'ic'>) {
        const { initiative, modifiers, host } = system;


        // Set current initiative to matrix
        initiative.perception = 'matrix';

        // Prepare used initiative parts
        initiative.matrix.base.base = MatrixRules.getICInitiativeBase(host.rating);
        initiative.matrix.base.mod = PartsList.AddUniquePart(initiative.matrix.base.mod, "SR5.Bonus", Number(modifiers['matrix_initiative']));

        initiative.matrix.dice.base = MatrixRules.getICInitiativeDice();
        initiative.matrix.dice.mod = PartsList.AddUniquePart(initiative.matrix.dice.mod, "SR5.Bonus", Number(modifiers['matrix_initiative_dice']));
    }

    /**
     * For connected hosts overwrite matrix attributes with the hosts attributes, otherwise leave as is.
     */
    static prepareHostAttributes(system: Actor.SystemOfType<'ic'>) {
        if (!system.host.id || !system.host.atts) return;

        Object.keys(system.host.atts).forEach(deviceAttribute => {
            const attribute: DeviceAttribute = system.host.atts[deviceAttribute];
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
            if (!attributes.hasOwnProperty(id)) continue;
            // Exclude invalid attributes for IC
            if (['magic', 'edge', 'essence', 'resonance'].includes(id)) continue

            const attribute = attributes[id];

            // Overwrite the base as it's missing on new actors and IC should only derive it's meat attributes
            // from it's host attributes.
            attribute.base = 0;

            const parts = new PartsList(attribute.mod);
            parts.addPart('SR5.Host.Rating', MatrixRules.getICMeatAttributeBase(host.rating));
            attribute.mod = parts.list;

            AttributesPrep.prepareAttribute(id, attribute);
        }
    }

    /**
     * Calculate all matrix attributes without the meat attributes
     */
    static prepareMatrixAttributes(system: Actor.SystemOfType<'ic'>) {
        const { matrix } = system;

        for (const id of Object.keys(SR5.matrixAttributes)) {
            if (!matrix.hasOwnProperty(id)) continue;

            const attribute = matrix[id];
            AttributesPrep.prepareAttribute(id, attribute);
        }
    }
}
