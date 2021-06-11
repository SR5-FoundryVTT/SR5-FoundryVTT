import ActorTypesData = Shadowrun.ShadowrunActorDataData;
import ShadowrunActorDataData = Shadowrun.ShadowrunActorDataData;

export class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    static prepareModifiers(data: ActorTypesData) {
        let modifiers = ModifiersPrep.commonModifiers;
        modifiers = modifiers.concat(ModifiersPrep.matrixModifiers);
        modifiers = modifiers.concat(ModifiersPrep.characterModifiers)
        ModifiersPrep.setupModifiers(data, modifiers);
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

    static setupModifiers(data, modifiers) {
        if (!data.modifiers) {
            data.modifiers = {};
        }

        // TODO: localize sorting of modifiers.
        modifiers.sort();
        // add and force global to the top
        modifiers.unshift('global');

        // Prepare sorted modifiers and merge with existing values when set.
        // Unset modifier values will be null or not exist at all.
        const sorted = {};
        for (const modifier of modifiers) {
            sorted[modifier] = Number(data.modifiers[modifier]) || 0;
        }

        data.modifiers = sorted;
    }

    static clearAttributeMods(data: ShadowrunActorDataData) {
        const { attributes } = data;
        for (const [, attribute] of Object.entries(attributes)) {
            attribute.mod = [];
        }
    }
}
