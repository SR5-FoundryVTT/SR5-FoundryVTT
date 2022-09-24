import { PartsList } from '../../../parts/PartsList';
import { Helpers } from '../../../helpers';
import {SR5} from "../../../config";
import ActorTypesData = Shadowrun.ShadowrunActorDataData;

export class LimitsPrep {
    static prepareLimits(system: ActorTypesData) {
        const { limits, modifiers } = system;


        // SETUP LIMITS
        limits.physical.mod = PartsList.AddUniquePart(limits.physical.mod, 'SR5.Bonus', Number(modifiers['physical_limit']));
        limits.mental.mod = PartsList.AddUniquePart(limits.mental.mod, 'SR5.Bonus', Number(modifiers['mental_limit']));
        limits.social.mod = PartsList.AddUniquePart(limits.social.mod, "SR5.Bonus", Number(modifiers['social_limit']));

        // limit labels
        for (let [name, limit] of Object.entries(limits)) {
            Helpers.calcTotal(limit);
            limit.label = SR5.limits[name];
        }
    }

    static prepareLimitBaseFromAttributes(system: ActorTypesData) {

        const { limits, attributes } = system;

        limits.physical.base = Math.ceil((2 * attributes.strength.value + attributes.body.value + attributes.reaction.value) / 3);
        limits.mental.base = Math.ceil((2 * attributes.logic.value + attributes.intuition.value + attributes.willpower.value) / 3);
        limits.social.base = Math.ceil((2 * attributes.charisma.value + attributes.willpower.value + attributes.essence.value) / 3);

    }
}
