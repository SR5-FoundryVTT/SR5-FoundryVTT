import { FLAGS, SYSTEM_NAME } from "../constants";
import type { SR5Actor } from "../actor/SR5Actor";
import type { DamageType } from "../types/item/Action";
import { DamageRules } from "./DamageRules";

/**
 * Elements with secondary effects applied automatically once their damage is taken.
 *
 * Acid burning on, fire catching and cold breaking armor need ongoing effects or the GMs judgement
 * and aren't applied here.
 */
export const AUTOMATED_ELEMENTS = ['electricity'];

/**
 * Secondary effects of elemental damage. SR5#170.
 */
export const ElementalRules = {
    /**
     * Does damage of these elements have a secondary effect to apply?
     */
    hasSecondaryEffects(damage: DamageType | undefined): boolean {
        if (!damage || damage.value <= 0) return false;
        return DamageRules.elements(damage).some(element => AUTOMATED_ELEMENTS.includes(element));
    },

    /**
     * Apply the secondary effects of damage an actor took.
     */
    async applySecondaryEffects(actor: SR5Actor, damage: DamageType | undefined) {
        if (!damage || !ElementalRules.hasSecondaryEffects(damage)) return;
        if (DamageRules.hasElement(damage, 'electricity')) await ElementalRules.applyElectricity(actor);
    },

    /**
     * Electricity damage taken: -1 to all actions and Defense Tests, but not Damage Resistance Tests,
     * for 1 Combat Turn and -5 Initiative Score right away. Further hits don't stack the penalty,
     * they extend it by 1 Combat Turn. SR5#170.
     */
    async applyElectricity(actor: SR5Actor) {
        const existing = actor.effects.find(effect => !effect.disabled && !effect.duration?.expired
            && foundry.utils.getProperty(effect.flags, `${SYSTEM_NAME}.${FLAGS.Elemental}`) === 'electricity');
        if (existing) {
            await existing.update({ 'duration.value': (existing.duration?.value ?? 1) + 1 } as ActiveEffect.UpdateData);
            return;
        }

        await actor.createEmbeddedDocuments('ActiveEffect', [{
            name: game.i18n.localize('SR5.Element.Electrified'),
            img: 'icons/svg/lightning.svg',
            duration: { value: 1, units: 'rounds', expiry: 'roundEnd' },
            flags: { [SYSTEM_NAME]: { [FLAGS.Elemental]: 'electricity' } },
            system: {
                targets: [{
                    id: 'penalty',
                    applyTo: 'test_all',
                    conditions: [{ type: 'tests', mode: 'exclude', values: ['PhysicalResistTest', 'MatrixResistTest', 'BiofeedbackResistTest', 'DrainTest', 'FadeTest'] }],
                }],
                changes: [{ key: 'data.pool', type: 'add', value: '-1', target: 'penalty' }],
            },
        } as unknown as ActiveEffect.CreateData]);

        if (game.combat?.started && game.combat.getActorCombatant(actor)) await actor.changeCombatInitiative(-5);
    },
};
