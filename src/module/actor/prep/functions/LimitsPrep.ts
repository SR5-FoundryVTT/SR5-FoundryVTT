import { SR5 } from "../../../config";
import { Helpers } from '../../../helpers';

export class LimitsPrep {
    static prepareLimits(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { limits, modifiers, special } = system;

        // Apply the actor local modifiers defined on the sheet.
        Helpers.addChange(limits.physical, { name: 'SR5.Bonus', value: modifiers.physical_limit });
        Helpers.addChange(limits.mental, { name: 'SR5.Bonus', value: modifiers.mental_limit });
        Helpers.addChange(limits.social, { name: 'SR5.Bonus', value: modifiers.social_limit });

        // Determine if the astral limit is relevant.
        if ('astral' in limits)
            limits.astral.hidden = special !== 'magic';

        for (const [name, limit] of Object.entries(limits)) {
            Helpers.calcTotal(limit);
            limit.label = SR5.limits[name];
        }
    }

    static prepareLimitBaseFromAttributes(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const { limits, attributes } = system;

        // Default limits are derived directly from attributes.
        limits.physical.base = Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3);
        limits.mental.base = Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3);
        limits.social.base = Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3);
    }

    /**
     * Some limits are derived from others or must be caluclated last.
     */
    static prepareDerivedLimits(system: Actor.SystemOfType<'character' | 'critter' | 'spirit'>) {
        const {limits, modifiers, special, attributes} = system;

        if (special === 'magic') {
            // Astral limit SR5#278.
            limits.astral.label = SR5.limits.astral;
            limits.astral.base = Math.max(limits.mental.value, limits.social.value);
            Helpers.addChange(limits.astral, { name: "SR5.Bonus", value: modifiers.astral_limit });
            Helpers.calcTotal(limits.astral);

            // Magic attribute as limit, hidden as it's directly derived from an attribute.
            limits.magic.base = attributes.magic.value;
            limits.magic.label = SR5.limits.magic;
            limits.magic.hidden = true;
            Helpers.calcTotal(limits.magic);
        }

        // Derive the initiation limit of a character from its initiation rank.
        limits.initiation.label = SR5.limits.initiation;
        limits.initiation.base = system.magic.initiation;
        limits.initiation.hidden = true;
        Helpers.calcTotal(limits.initiation, { min: 0 });
    }
}
