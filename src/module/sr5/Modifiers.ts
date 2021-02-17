import {SR} from "../constants";

export class Modifiers {
    // TODO: Add typing
    static getDefaultEnvironmentalModifiers() {
        return {
            total: 0,
            active: {
                visibility: 0,
                light: 0,
                wind: 0,
                range: 0,
                value: 0,
            }
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