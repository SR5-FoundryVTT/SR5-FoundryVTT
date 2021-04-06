import {BaseActorPrep} from "./BaseActorPrep";
import {ModifiersPrep} from "./functions/ModifiersPrep";
import SR5ICType = Shadowrun.SR5ICType;
import ICActorData = Shadowrun.ICActorData;

export class ICPrep extends BaseActorPrep<SR5ICType, ICActorData> {
    prepare() {
        ICPrep.prepareModifiers(this.data);
    }

    /**
     * Misc Tab IC modifiers.
     * @param data
     */
    static prepareModifiers(data: ICActorData) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        ModifiersPrep.setupModifiers(data, modifiers);
    }
}