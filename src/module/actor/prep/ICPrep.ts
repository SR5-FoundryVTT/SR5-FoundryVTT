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

export class ICPrep extends BaseActorPrep<SR5ICType, ICActorData> {
    prepare() {
        ICPrep.prepareModifiers(this.data);
        ModifiersPrep.clearAttributeMods(this.data);

        ICPrep.prepareMatrix(this.data);
        ICPrep.prepareMatrixTrack(this.data);

        // SkillsPrep.prepareSkills(this.data);
        ICPrep.prepareMatrixInit(this.data);

        AttributesPrep.prepareAttributes(this.data);
        ICPrep.prepareAttributes(this.data);
    }

    /**
     * Misc Tab IC modifiers.
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
        data.matrix.condition_monitor.max = MatrixRules.getConditionMonitor(data.matrix.rating);
    }

    static prepareMatrixInit(data) {
        const { initiative, host } = data;
        initiative.matrix.base.base = host.rating
    }

    /**
     * Hide all meat attributes from display
     */
    static prepareAttributes(data: ICActorData) {
        const { attributes } = data;

        for (const attribute of Object.values(attributes)) {
            attribute.hidden = true;
        }
    }
}