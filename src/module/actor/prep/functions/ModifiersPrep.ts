import { SR5 } from "../../../config";

export class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     * 
     * NOTE: Currently these aren't controlled by the Foundry template. But ONLY here.
     *       Therefore adding a modifier to an actor DataModel happens here and during Actor#prepareData
     */
    static prepareModifiers(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'sprite' | 'vehicle'>) {
        let modifiers = ModifiersPrep.commonModifiers as string[];
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        modifiers = modifiers.concat(ModifiersPrep.characterModifiers);

        ModifiersPrep.setupModifiers(system, modifiers);
    }

    /**
     * Modifiers that appear on all actor types.
     */
    static get commonModifiers(): (keyof Shadowrun.CommonModifiers)[] {
        return [
            'defense', 
            'defense_dodge',
            'defense_block', 
            'defense_parry',
            'defense_melee',
            'defense_ranged',
            'soak'
        ];
    }

    /**
     * Modifiers that appear on all character actors.
     */
    static get characterModifiers(): (keyof Shadowrun.CharacterModifiers)[] {
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
            'multi_defense',
            'reach'
        ];
    }

    /**
     * Modifiers that appear on all matrix actor types.
     */
    static get matrixModifiers(): (keyof Shadowrun.MatrixModifiers)[] {
        return [
            'matrix_initiative',
            'matrix_initiative_dice',
            'matrix_track'
        ]
    }

    static setupModifiers(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>, modifiers: string[]) {
        if (!system.modifiers) {
            //@ts-expect-error
            system.modifiers = {};
        }

        modifiers.sort();
        modifiers.unshift('global');

        // Clear existing keys while preserving the original object reference
        for (const key of Object.keys(system.modifiers)) {
            delete system.modifiers[key];
        }

        // Repopulate in sorted order
        for (const modifier of modifiers) {
            system.modifiers[modifier] = Number(system.modifiers[modifier]) || 0;
        }
    }

    static clearAttributeMods(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { attributes } = system;
        for (const [name, attribute] of Object.entries(attributes)) {
            // Check for valid attributes. Active Effects can cause unexpected properties to appear.
            if (!SR5.attributes.hasOwnProperty(name) || !attribute) return;

            attribute.mod = [];
        }
    }

    static clearArmorMods(system:Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'vehicle'>) {
        const {armor} = system;

        armor.mod = [];
    }

    static clearLimitMods(system: Actor.SystemOfType<'character' | 'critter' | 'ic' | 'spirit' | 'sprite' | 'vehicle'>) {
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
    static clearValueMods(system: Actor.SystemOfType<'character'>) {
        for (const [name, values] of Object.entries(system.values)) {
            values.mod = [];
        }
    }
}
