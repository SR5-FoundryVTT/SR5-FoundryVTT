import {FLAGS, SR, SYSTEM_NAME} from "../constants";
import SituationModifiers = Shadowrun.SituationModifiers;
import EnvironmentalModifiers = Shadowrun.EnvironmentalModifiers;
import EnvironmentalModifierLevels = Shadowrun.EnvironmentalModifierLevels;

export class Modifiers {
    data: SituationModifiers;

    constructor(data: SituationModifiers) {
        // Fail gracefully for no modifiers given.
        // This can happen as Foundry returns empty objects for no flags set.
        if (!data || Object.keys(data).length === 0) {
            data = Modifiers.getDefaultModifiers();
        }

        this.data = data;
    }

    get hasActiveEnvironmental(): boolean {
        return Object.keys(this.data.environmental.active).length > 0;
    }

    get modifiers(): SituationModifiers {
        return this.data;
    }

    get environmental(): EnvironmentalModifiers {
        return this.data.environmental;
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

    static async getModifiersFromEntity(entity: Entity): Promise<Modifiers> {
        const data = await entity.getFlag(SYSTEM_NAME, FLAGS.Modifier);
        return new Modifiers(data);
    }

    static async setModifiersOnEntity(entity: Entity, modifiers: SituationModifiers) {
        await entity.unsetFlag(SYSTEM_NAME, FLAGS.Modifier);
        await entity.setFlag(SYSTEM_NAME, FLAGS.Modifier, modifiers);
    }
}