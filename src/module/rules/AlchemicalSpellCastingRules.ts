import AlchemyTrigger = Shadowrun.AlchemyTrigger;
import { SpellcastingRules } from "./SpellcastingRules";

/**
 * Rules implementing the Alchemy chapter in SR5.304
 */
export class AlchemicalSpellCastingRules extends SpellcastingRules{

    /**
     * Calculate alchemical spellcasting drain value without its damage type
     *
     * As defined in SR5#304 - Step 6 Resist Drain.
     *
     * @param force The force the spell is cast with.
     * @param drainModifier The drain modifier defined within the spells action configuration.
     * @param reckless Set this to true should the spell be cast recklessly as defined in SR5#281 Cast Spell.
     */
    static calculatePreparationDrain(force: number, drainModifier: number, trigger: AlchemyTrigger): number {
        const recklessModifier = trigger == 'contact' ? this.contactDrainModifier : this.otherDrainModifier;
        const drain = force + drainModifier + recklessModifier;
        return Math.max(this.minimalDrain, drain);
    }

    /**
     * As defined in SR5#305
     */
    static get otherDrainModifier(): number {
        return 2;
    }

    /**
     * As defined in SR5#305.
     *
     * Reckless spellcasting will alter drain damage.
     */
    static get contactDrainModifier(): number {
        return 1;
    }

    /**
     * Determine the amount of services a spirit will provide the it's summoner
     * 
     * @param hitsAlchemist Hits of the alchemist test.
     * @param hitsPreperation Hits of the preperation opposing test.
     */
    static potency(hitsAlchemist: number, hitsPreperation: number): number {
        return Math.max(hitsAlchemist - hitsPreperation, 0);
    }

    /**
     * Determine if the chosen force is valid for the given magic attribute.
     * 
     * See SR5#304 'Alchemy' Step 2.
     * 
     * @param force The force value.
     * @param magic The magic attribute value.
     */
    static validForce(force: number, magic: number): boolean {
        if (force < 1) return false;
        return force <= magic * 2;
    }

    

}