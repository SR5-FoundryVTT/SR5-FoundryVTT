import {SR5Actor} from "../SR5Actor";
import {SR5Item} from '../../item/SR5Item';
import { DamageType } from "src/module/types/item/Action";

export class SoakFlow {
    knocksDown(damage: DamageType, actor: SR5Actor) {
        // TODO: SR5 195 Called Shot Knock Down (Melee Only), requires attacker STR and actually announcing that called shot.
        const gelRoundsEffect = this.isDamageFromGelRounds(damage) ? -2 : 0;  // SR5 434
        const impactDispersionEffect = this.isDamageFromImpactDispersion(damage) ? -2 : 0  // FA 52
        const limit = actor.getLimit('physical');

        if (!limit) return false;

        const effectiveLimit = limit.value + gelRoundsEffect + impactDispersionEffect
        // SR5 194
        const knockedDown = damage.value > effectiveLimit || damage.value >= 10;

        console.log(`Shadowrun5e | Determined target ${actor.id} knocked down status as: ${knockedDown}`, damage, actor);

        return knockedDown;
    }

    isDamageFromGelRounds(damage: DamageType) {
        if (damage.source?.actorId && damage.source.itemId) {
            const attacker = game.actors?.find(actor => actor.id === damage.source?.actorId);
            if (attacker) {
                const item = attacker.items.find(item => item.id === damage.source?.itemId) as SR5Item;
                if (item) {
                    return item.items
                        .filter(mod => mod.getTechnologyData()?.equipped)
                        .filter(tech => tech.name === game.i18n.localize("SR5.AmmoGelRounds")).length > 0;
                }
            }
        }
        return false;
    }

    isDamageFromImpactDispersion(damage: DamageType) {
        // TODO: FA 52. Ammo currently cannot have mods, so not sure how to implement Alter Ballistics idiomatically.
        return false;
    }
}
