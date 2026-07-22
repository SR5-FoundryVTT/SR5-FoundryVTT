import { SR5 } from "../../../config";
import { ModifiableValue } from "@/module/mods/ModifiableValue";

export class LimitsPrep {
    static prepareLimits(system: Actor.SystemOfType<'character' | 'spirit' | 'sprite' | 'vehicle'>) {
        const { limits, modifiers, special } = system;

        // Apply the actor local modifiers defined on the sheet.
        ModifiableValue.addUnique(limits.physical, 'SR5.Bonus', modifiers.physical_limit);
        ModifiableValue.addUnique(limits.mental, 'SR5.Bonus', modifiers.mental_limit);
        ModifiableValue.addUnique(limits.social, 'SR5.Bonus', modifiers.social_limit);

        // Determine if the astral limit is relevant.
        if ('astral' in limits)
            limits.astral.hidden = special !== 'magic';

        for (const [name, limit] of Object.entries(limits)) {
            ModifiableValue.applyChanges(limit);
            limit.label = SR5.limits[name];
        }
    }

    static prepareLimitBaseFromAttributes(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const { limits, attributes } = system;

        // Default limits are derived directly from attributes, logged as BASE_PRIORITY anchors. `base` is
        // zeroed so it contributes nothing to the fold; the zeroing goes away when `base` leaves the schema.
        limits.physical.base = 0;
        limits.mental.base = 0;
        limits.social.base = 0;

        ModifiableValue.addUniqueBase(limits.physical, 'SR5.BaseValue',
            Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3));
        ModifiableValue.addUniqueBase(limits.mental, 'SR5.BaseValue',
            Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3));
        ModifiableValue.addUniqueBase(limits.social, 'SR5.BaseValue',
            Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3));
    }

    /**
     * Some limits are derived from others or must be caluclated last.
     */
    static prepareDerivedLimits(system: Actor.SystemOfType<'character' | 'spirit'>) {
        const {limits, modifiers, special, attributes} = system;

        if (special === 'magic') {
            // Astral limit SR5#278.
            limits.astral.label = SR5.limits.astral;
            limits.astral.base = 0;
            ModifiableValue.addUniqueBase(limits.astral, 'SR5.BaseValue',
                Math.max(limits.mental.value, limits.social.value));
            ModifiableValue.addUnique(limits.astral, "SR5.Bonus", modifiers.astral_limit);
            ModifiableValue.applyChanges(limits.astral);

            // Magic attribute as limit, hidden as it's directly derived from an attribute.
            limits.magic.base = 0;
            ModifiableValue.addUniqueBase(limits.magic, 'SR5.BaseValue', attributes.magic.value);
            limits.magic.label = SR5.limits.magic;
            limits.magic.hidden = true;
            ModifiableValue.applyChanges(limits.magic);
        }

        // Derive the initiation limit of a character from its initiation rank.
        limits.initiation.label = SR5.limits.initiation;
        limits.initiation.base = 0;
        ModifiableValue.addUniqueBase(limits.initiation, 'SR5.BaseValue', system.magic.initiation);
        limits.initiation.hidden = true;
        ModifiableValue.applyChanges(limits.initiation, { min: 0 });
    }
}
