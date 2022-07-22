/**
 * Handle all rules related to Shadowrun 5 magic drain.
 */
import DamageData = Shadowrun.DamageData;
import {DefaultValues} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import DamageType = Shadowrun.DamageType;
import {PartsList} from "../parts/PartsList";

export class DrainRules {
    /**
     * Calculate spell casting drain damage according to SR5#281-282
     *
     * @param drain The drain value
     * @param force The force value used to cast
     * @param magic The magic attribute level of the caster
     * @param hits Spellcasting test hits
     */
    static calcDrainDamage(drain: number, force: number, magic: number, hits: number): DamageData {
        if (force < 0) force = 1;
        if (magic < 0) magic = 1;
        if (hits < 0) hits = 0;

        const damage = DefaultValues.damageData();
        damage.base = drain;
        Helpers.calcTotal(damage, {min: 0});
        damage.type.base = damage.type.value = DrainRules.calcDrainDamageType(hits, magic);

        return damage;
    }

    /**
     * Get the drain damage type according to SR5#281 'Step 3'
     * @param hits The spell casting test hits AFTER limit
     * @param magic The magic attribute level of the caster
     */
    static calcDrainDamageType(hits: number, magic: number): DamageType {
        if (hits < 0) hits = 0;
        if (magic < 0) magic = 1;
        return hits > magic ? 'physical' : 'stun';
    }

    /**
     * Modify the drain damage after the spell casting test has been completed.
     *
     * @param drainDamage The base drain damage after force / drain has been chosen.
     * @param hits The spell casting test hits
     */
    static modifyDrainDamage(drainDamage: DamageData, hits: number) {
        if (hits < 0) hits = 0;

        drainDamage = foundry.utils.duplicate(drainDamage);

        PartsList.AddUniquePart(drainDamage.mod, 'SR5.Hits', -hits);
        Helpers.calcTotal(drainDamage, {min: 0});

        return drainDamage;
    }
}