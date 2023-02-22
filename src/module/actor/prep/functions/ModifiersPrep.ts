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
     * 
     * NOTE: Currently these aren't controlled by the Foundry template. But ONLY here.
     *       Therefore adding a modifier to an actor DataModel happens here and during Actor#prepareData
     */
    static prepareModifiers(system: ActorTypesData) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        modifiers = modifiers.concat(ModifiersPrep.characterModifiers);
        ModifiersPrep.setupModifiers(system, modifiers);
    }

    /**
     * Modifiers that appear on all actor types.
     */
    static get commonModifiers() {
        return [
            'defense', 
            'defense_dodge',
            'defense_block', 
            'defense_parry',
            'recoil', 
            'soak'
        ];
    }

    /**
     * Modifiers that appear on all character actors.
     */
    static get characterModifiers() {
        return [
            'drain',
            'armor',
            'physical_limit',
            'social_limit',
            'mental_limit',
            'astral_limit',
            'stun_track',
            'physical_track',
            'physical_overflow_track',
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
            'pain_tolerance_stun',
            'pain_tolerance_physical',
            'essence',
            'fade',
            'multi_defense'
        ];
    }

    /**
     * Modifiers that appear on all matrix actor types.
     */
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

    /**
     * Clear out modifierse from all calculate values, no matter where from and what.
     * 
     * This is necessary to avoid items and naive modifications doubling up shoudl they be
     * saved with update calls
     * 
     */
    static clearValueMods(system: ShadowrunActorDataData) {
        for (const [name, values] of Object.entries(system.values)) {
            values.mod = [];
        }
    }
}
