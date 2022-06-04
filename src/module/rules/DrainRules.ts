/**
 * Handle all rules related to Shadowrun 5 magic drain.
 */
import DamageData = Shadowrun.DamageData;
import {DefaultValues} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import DamageType = Shadowrun.DamageType;
import {PartsList} from "../parts/PartsList";

export class DrainRules {
    static calcDrainDamage(drain: number, force: number, magic: number): DamageData {
        console.error("Add rules reference");

        if (force < 0) force = 1;
        if (magic < 0) magic = 1;

        const damage = DefaultValues.damageData();
        damage.base = drain;
        Helpers.calcTotal(damage, {min: 0});
        damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(force, magic);

        return damage;
    }

    static calcDrainDamageType(force: number, magic: number): DamageType {
        console.error("Add rules reference");
        if (force < 0) force = 1;
        if (magic < 0) magic = 1;
        return force > magic ? 'physical' : 'stun';
    }

    static modifyDrainDamage(drainDamage: DamageData, hits: number) {
        console.error("Add rules reference");

        if (hits < 0) hits = 0;

        PartsList.AddUniquePart(drainDamage.mod, 'SR5.Hits', -hits);
        Helpers.calcTotal(drainDamage, {min: 0});
    }
}