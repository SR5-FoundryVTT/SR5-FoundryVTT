import {BaseActorPrep} from "./BaseActorPrep";
import {ModifiersPrep} from "./functions/ModifiersPrep";
import SR5ICType = Shadowrun.SR5ICType;
import ICActorData = Shadowrun.ICActorData;
import {MatrixRules} from "../../sr5/Matrix";
import {SkillsPrep} from "./functions/SkillsPrep";
import {InitiativePrep} from "./functions/InitiativePrep";
import AttributeField = Shadowrun.AttributeField;
import SR5ActorData = Shadowrun.SR5ActorData;
import {AttributesPrep} from "./functions/AttributesPrep";
import {PartsList} from "../../parts/PartsList";
import {SR5} from "../../config";
import {MatrixPrep} from "./functions/MatrixPrep";
import {DefaultValues} from "../../dataTemplates";

export class ICPrep extends BaseActorPrep<SR5ICType, ICActorData> {
    prepare() {
        // Add missing values on actor creation
        ICPrep.addMissingTracks(this.data);

        // Base value preparations.
        ICPrep.prepareModifiers(this.data);
        ModifiersPrep.clearAttributeMods(this.data);

        ICPrep.hideMeatAttributes(this.data);
        ICPrep.prepareMeatAttributes(this.data);
        ICPrep.prepareMatrixAttributes(this.data);
        MatrixPrep.prepareMatrixToLimitsAndAttributes(this.data);

        // Derived value preparations
        ICPrep.prepareMatrix(this.data);
        ICPrep.prepareMatrixTrack(this.data);

        // SkillsPrep.prepareSkills(this.data);
        ICPrep.prepareMatrixInit(this.data);
        InitiativePrep.prepareCurrentInitiative(this.data);
    }

    /**
     * On initial actor creation the matrix track will be missing.
     *
     * This is intentional as not to pollute template.json with actor type specific data.
     *
     */
    static addMissingTracks(data) {
        // Newly created actors SHOULD have this by template.
        // Legacy actors MIGHT not have it, therefore make sure it's their.
        const track = data.track || {};
        if (!track.matrix) track.matrix = DefaultValues.trackData();
        data.track = track;
    }

    /**
     * Add IC modifiers only to the misc tab.
     * @param data
     */
    static prepareModifiers(data) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        ModifiersPrep.setupModifiers(data, modifiers);
    }

    static prepareMatrix(data) {
        data.matrix.rating = MatrixRules.getICDeviceRating(data.host.rating);
    }

    static prepareMatrixTrack(data) {
        const { modifiers, track, matrix } = data;

        // Prepare internal matrix condition monitor values
        // LEGACY: matrix.condition_monitor is no TrackType. It will only be used as a info, should ever be needed anywhere
        matrix.condition_monitor.max = Number(modifiers['matrix_track']) + MatrixRules.getConditionMonitor(matrix.rating);

        // Prepare user visible matrix track values
        track.matrix.base = MatrixRules.getConditionMonitor(matrix.rating);
        track.matrix.mod = PartsList.AddUniquePart(track.matrix.mod, "SR5.Bonus", Number(modifiers['matrix_track']));
        track.matrix.max = matrix.condition_monitor.max;
        track.matrix.label = SR5.damageTypes.matrix;
    }

    static prepareMatrixInit(data) {
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
     * Hide all meat attributes from display
     */
    static hideMeatAttributes(data: ICActorData) {
        const { attributes } = data;

        for (const attribute of Object.values(attributes)) {
            attribute.hidden = true;
        }
    }

    static prepareMeatAttributes(data: ICActorData) {
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
    static prepareMatrixAttributes(data: ICActorData) {
        const { matrix } = data;

        for (const id of Object.keys(SR5.matrixAttributes)) {
            if (!matrix.hasOwnProperty(id)) continue;

            const attribute = matrix[id];
            AttributesPrep.prepareAttribute(id, attribute);
        }
    }
}