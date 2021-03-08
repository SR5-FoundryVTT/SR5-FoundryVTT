import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import SituationModifiers = Shadowrun.SituationModifiers;
import EnvironmentalModifiers = Shadowrun.EnvironmentalModifiers;
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;

export class Modifiers {
    data: SituationModifiers;

    constructor(data: SituationModifiers) {
        this.data = data;
    }

    calculateTotal() {

    }

    // setActive

    static getDefaultEnvironmentalModifiers(): EnvironmentalModifiers  {
        return {
            total: 0,
            active: {}
        }
    }

    static getDefaultModifiers(): SituationModifiers {
        return {
            environmental: Modifiers.getDefaultEnvironmentalModifiers()
        }
    }

    static getEnvironmentalModifierLevels(): EnvironmentalModifierLevels {
        return SR.combat.environmental.levels;
    }

    static async getModifiersFromEntity(entity: Entity) {
        return await entity.getFlag(SYSTEM_NAME, FLAGS.Modifier);
    }

    static async setModifiersOnEntity(entity: Entity, modifiers: SituationModifiers) {
        await entity.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await entity.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    }
}