import {DataDefaults} from "../data/DataDefaults";
import {Helpers} from "../helpers";
import {PartsList} from "../parts/PartsList";
import { DamageType } from "../types/item/Action";
type DamageTypeType = Item.SystemOfType<'action'>['action']['damage']['type']['base'];

export const FadeRules = {

    /**
     * Calculate fade damage according to SR5#251 section Fading
     *
     * @param fade The fade value after threading test
     * @param hits The amount of hits during threading
     * @param resonance The resonance attribute rating
     */
    calcFadeDamage: function (fade: number, hits: number, resonance: number): DamageType {
        if (hits < 0) hits = 0;
        if (resonance < 1) resonance = 1;

        const damage = DataDefaults.createData('damage');
        damage.base = fade;
        Helpers.calcTotal(damage, {min: 0});

        damage.type.base = damage.type.value = FadeRules.calcFadeDamageType(hits, resonance);

        return damage;
    },

    /**
     * Calculate the damage type for fade damage according to threading hits according to SR5#251 section Fading
     * @param hits Threading test hits
     * @param resonance attribute rating
     */
    calcFadeDamageType: function(hits: number, resonance: number): DamageTypeType {
        if (hits < 0) hits = 0;
        if (resonance < 0) resonance = 1;
        return hits > resonance ? 'physical' : 'stun';
    },

    /**
     * Modify fade damage after a fade resist test according to SR5#251 section Fading
     */
    modifyFadeDamage: function(fadeDamage: DamageType, hits: number) {
        if (hits < 0) hits = 0;

        fadeDamage = foundry.utils.duplicate(fadeDamage) as DamageType;

        PartsList.AddUniquePart(fadeDamage.mod, 'SR5.Hits', -hits);
        Helpers.calcTotal(fadeDamage, {min: 0});

        return fadeDamage;
    }
}