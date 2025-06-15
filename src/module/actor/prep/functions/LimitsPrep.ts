import { LimitRules } from './../../../rules/LimitRules';
import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';
import { SR5 } from "../../../config";

export class LimitsPrep {
    static prepareLimits(system: Actor.SystemOfType<'character' | 'critter' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { limits, modifiers, special } = system;

        // Apply the actor local modifiers defined on the sheet.
        limits.physical.mod = PartsList.AddUniquePart(limits.physical.mod, 'SR5.Bonus', Number(modifiers['physical_limit']));
        limits.mental.mod = PartsList.AddUniquePart(limits.mental.mod, 'SR5.Bonus', Number(modifiers['mental_limit']));
        limits.social.mod = PartsList.AddUniquePart(limits.social.mod, "SR5.Bonus", Number(modifiers['social_limit']));
        
        // Determine if the astral limit is relevant.
        if ('astral' in limits)
            limits.astral.hidden = special !== 'magic';

        for (let [name, limit] of Object.entries(limits)) {
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
            // Astral limit.
            limits.astral = LimitRules.calculateAstralLimit(limits.astral, limits.mental, limits.social);
            limits.astral.mod = PartsList.AddUniquePart(limits.astral.mod, "SR5.Bonus", Number(modifiers['astral_limit']));
            Helpers.calcTotal(limits.astral);

            // Magic attribute as limit, hidden as it's directly derived from an attribute.
            limits.magic = LimitRules.calculateMagicLimit(attributes.magic);
            limits.magic.hidden = true;
            Helpers.calcTotal(limits.magic);
        }

        if("magic" in system) {
            limits.initiation = LimitRules.calculateInitiationSubmersionLimit(system.magic.initiation)
            Helpers.calcTotal(limits.initiation, {min: 0} );
        }
        
    }
}
