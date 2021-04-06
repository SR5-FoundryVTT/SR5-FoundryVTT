import {BaseActorPrep} from "./BaseActorPrep";
import {ModifiersPrep} from "./functions/ModifiersPrep";
import SR5ICType = Shadowrun.SR5ICType;
import ICActorData = Shadowrun.ICActorData;
import {MatrixRules} from "../../sr5/Matrix";

export class ICPrep extends BaseActorPrep<SR5ICType, ICActorData> {
    prepare() {
        ICPrep.prepareModifiers(this.data);
        ICPrep.prepareMatrix(this.data);
        ICPrep.prepareMatrixTrack(this.data);
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
}