import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import ShadowrunActorDataData = Shadowrun.ShadowrunActorDataData;
import {SR5} from "../../../config";
import CharacterData = Shadowrun.CharacterData;
import CritterData = Shadowrun.CritterData;
import SpiritData = Shadowrun.SpiritData;
import VehicleData = Shadowrun.VehicleData;

export class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    static prepareModifiers(system: ActorTypesData) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        modifiers = modifiers.concat(ModifiersPrep.characterModifiers)
        ModifiersPrep.setupModifiers(system, modifiers);
    }

    static get commonModifiers() {
        return ['soak', 'defense'];
    }

    static get characterModifiers() {
        return [
            'drain',
            'armor',
            'physical_limit',
            'social_limit',
            'mental_limit',
            'stun_track',
            'physical_track',
            'meat_initiative',
            'meat_initiative_dice',
            'astral_initiative',
            'astral_initiative_dice',
            'composure',
            'lift_carry',
            'judge_intentions',
            'memory',
            'walk',
            'run',
            'wound_tolerance',
            'essence',
            'fade',
        ];
    }

    static get matrixModifiers() {
        return [
            'matrix_initiative',
            'matrix_initiative_dice',
            'matrix_track'
        ]
    }

    static setupModifiers(system: ShadowrunActorDataData, modifiers) {
        if (!system.modifiers) {
            system.modifiers = {};
        }

        // TODO: localize sorting of modifiers.
        modifiers.sort();
        // add and force global to the top
        modifiers.unshift('global');

        // Prepare sorted modifiers and merge with existing values when set.
        // Unset modifier values will be null or not exist at all.
        const sorted = {};
        for (const modifier of modifiers) {
            sorted[modifier] = Number(system.modifiers[modifier]) || 0;
        }

        system.modifiers = sorted;
    }

    static clearAttributeMods(system: ShadowrunActorDataData) {
        const { attributes } = system;
        for (const [name, attribute] of Object.entries(attributes)) {
            // Check for valid attributes. Active Effects can cause unexpected properties to appear.
            if (!SR5.attributes.hasOwnProperty(name) || !attribute) return;

            attribute.mod = [];
        }
    }

    static clearArmorMods(system: CharacterData|CritterData|SpiritData|VehicleData) {
        const {armor} = system;

        armor.mod = [];
    }

    static clearLimitMods(system: ShadowrunActorDataData) {
        const {limits} = system;
        for (const [name, limit] of Object.entries(limits)) {
            if (!SR5.limits.hasOwnProperty(name) || !limit) return;

            limit.mod = [];
        }
    }
}
