import SR5ActorData = Shadowrun.SR5ActorData;

export class LimitsPrep {
    static prepareLimits(data: SR5ActorData) {
        const { limits, attributes, modifiers } = data;

        // SETUP LIMITS
        limits.physical.value =
            Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3) + Number(modifiers['physical_limit']);
        limits.mental.value =
            Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3) + Number(modifiers['mental_limit']);
        limits.social.value =
            Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3) + Number(modifiers['social_limit']);

        // limit labels
        for (let [limitKey, limitValue] of Object.entries(limits)) {
            limitValue.label = CONFIG.SR5.limits[limitKey];
        }
    }
}

