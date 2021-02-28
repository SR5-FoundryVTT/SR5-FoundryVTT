import {SR} from "../constants";

export class Modifiers {
    // TODO: Add typing
    static getDefaultEnvironmentalModifiers() {
        return {
            total: 0,
            active: {}
        }
    }

    static getDefaultModifiers() {
        return {
            environmental: Modifiers.getDefaultEnvironmentalModifiers()
        }
    }
    // TODO: Add typing
    static getEnvironmentalModifierLevels() {
        return SR.combat.environmental.levels;
    }
}