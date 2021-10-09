import {ModifiersPrep} from "./functions/ModifiersPrep";
import {InitiativePrep} from "./functions/InitiativePrep";
import {AttributesPrep} from "./functions/AttributesPrep";
import {PartsList} from "../../parts/PartsList";
import {SR5} from "../../config";
import {MatrixPrep} from "./functions/MatrixPrep";
import ICData = Shadowrun.ICData;
import {SR5ItemDataWrapper} from "../../data/SR5ItemDataWrapper";
import {DefaultValues} from "../../data/DataDefaults";
import {MatrixRules} from "../../rules/MatrixRules";
import DeviceAttribute = Shadowrun.DeviceAttribute;
import {SkillsPrep} from "./functions/SkillsPrep";


export class ICPrep {
    static prepareBaseData(data: ICData) {
        ModifiersPrep.clearAttributeMods(data);
        ModifiersPrep.clearLimitMods(data);

        ICPrep.addMissingTracks(data);
        ICPrep.prepareModifiers(data);
        ICPrep.hideMeatAttributes(data);
    }

    static prepareDerivedData(data: ICData, items: SR5ItemDataWrapper[]) {
        ICPrep.prepareMatrixAttributes(data);

        SkillsPrep.prepareSkills(data);

        ICPrep.prepareHostAttributes(data);
        ICPrep.prepareMeatAttributes(data);

        MatrixPrep.prepareMatrixToLimitsAndAttributes(data);

        ICPrep.prepareMatrix(data);
        ICPrep.prepareMatrixTrack(data);

        ICPrep.prepareMatrixInit(data);
        InitiativePrep.prepareCurrentInitiative(data);
    }

    /**
     * On initial actor creation the matrix track will be missing.
     *
     * This is intentional as not to pollute template.json with actor type specific data.
     *
     */
    static addMissingTracks(data: ICData) {
        // Newly created actors SHOULD have this by template.
        // Legacy actors MIGHT not have it, therefore make sure it's their.
        const track = data.track || {};
        // @ts-ignore
        if (!track.matrix) track.matrix = DefaultValues.trackData();
        // @ts-ignore
        data.track = track;
    }

    /**
     * Add IC modifiers only to the misc tab.
     * @param data
     */
    static prepareModifiers(data: ICData) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        ModifiersPrep.setupModifiers(data, modifiers);
    }

    static prepareMatrix(data: ICData) {
        data.matrix.rating = MatrixRules.getICDeviceRating(data.host.rating);
    }

    static prepareMatrixTrack(data: ICData) {
        const { modifiers, track, matrix } = data;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = Number(modifiers['matrix_track']) + MatrixRules.getConditionMonitor(matrix.rating as number);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getConditionMonitor(matrix.rating as number);
        track.matrix.mod = PartsList.AddUniquePart(track.matrix.mod, "SR5.Bonus", Number(modifiers['matrix_track']));
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMatrixInit(data: ICData) {
        const { initiative, modifiers, host } = data;


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
    static prepareHostAttributes(data: ICData) {
        if (!data.host.id || !data.host.atts) return;

        Object.keys(data.host.atts).forEach(deviceAttribute => {
            const attribute: DeviceAttribute = data.host.atts[deviceAttribute];
            data.matrix[attribute.att].base = attribute.value;
            data.matrix[attribute.att].device_att = deviceAttribute;
        });
    }

    /**
     * Hide all meat attributes from display
     */
    static hideMeatAttributes(data: ICData) {
        const { attributes } = data;

        for (const attribute of Object.values(attributes)) {
            attribute.hidden = true;
        }
    }

    static prepareMeatAttributes(data: ICData) {
        const { attributes, host } = data;

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
    static prepareMatrixAttributes(data: ICData) {
        const { matrix } = data;

        for (const id of Object.keys(SR5.matrixAttributes)) {
            if (!matrix.hasOwnProperty(id)) continue;

            const attribute = matrix[id];
            AttributesPrep.prepareAttribute(id, attribute);
        }
    }

}