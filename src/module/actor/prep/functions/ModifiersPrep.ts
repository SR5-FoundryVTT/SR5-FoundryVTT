import SR5ActorData = Shadowrun.SR5ActorData;

export class ModifiersPrep {
    /**
     * Prepare the modifiers that are displayed in the Misc. tab
     */
    static prepareModifiers(data: SR5ActorData) {
        if (!data.modifiers) data.modifiers = {};
        const modifiers = {};
        let miscTabModifiers = [
            'soak',
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
            'matrix_initiative',
            'matrix_initiative_dice',
            'composure',
            'lift_carry',
            'judge_intentions',
            'memory',
            'walk',
            'run',
            'defense',
            'wound_tolerance',
            'essence',
            'fade',
        ];
        miscTabModifiers.sort();
        // force global to the top
        miscTabModifiers.unshift('global');

        for (let item of miscTabModifiers) {
            modifiers[item] = Number(data.modifiers[item]) || 0;
        }

        data.modifiers = modifiers;
    }

    static clearAttributeMods(data: SR5ActorData) {
        const { attributes } = data;
        for (const [, attribute] of Object.entries(attributes)) {
            attribute.mod = [];
        }
    }
}
