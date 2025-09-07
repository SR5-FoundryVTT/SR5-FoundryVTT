import { SR5Actor } from "../actor/SR5Actor";
import { DataDefaults } from "../data/DataDefaults";
import { MatrixRules } from "../rules/MatrixRules";
import { BiofeedbackResistTest } from "../tests/BiofeedbackResistTest";
import { ResistTestData } from "../tests/flows/ResistTestDataFlow";
import { TestCreator } from "../tests/TestCreator";
import { DamageType } from "../types/item/Action";

/**
 * Handles damage application and related effects in the matrix.
 */
export const MatrixDamageFlow = {
    /**
     * Determine if the actor should take biofeedback damage from the damage taken
     * @param actor
     * @param damage
     */
    async determineBiofeedbackDamage(actor: SR5Actor, damage: DamageType) {
        if (actor.takesBiofeedbackDamageFrom(damage)) {
            const biofeedbackDamage = this.getBiofeedbackResistDamage(actor, damage);
            const action = DataDefaults.createData('action_roll', {
                    ...BiofeedbackResistTest._getDefaultTestAction(),
                    test: 'BiofeedbackResistTest',
                });
            const data = TestCreator._prepareTestDataWithAction(action, actor, {
                ...TestCreator._minimalTestData(),
                action,
                type: 'BiofeedbackResistTest',
            }) as ResistTestData;
            data.incomingDamage = biofeedbackDamage;
            data.modifiedDamage = data.incomingDamage;

            const test = TestCreator.fromTestData(data, {source: actor});
            await test.execute();
        }
    },

    /**
     * Get the amount of damage an actor needs to resist as Biofeedback Damage
     * - biofeedback comes from 2 sources: Matrix Damage and Physical (meatspace) damage
     * - matrix damage becomes biofeedback when someone in VR takes matrix damage laced with Biofeedback
     * - physical damage becomes biofeedback when a Drone takes damage and someone is Jumped Into it
     * @param actor
     * @param damage
     */
    getBiofeedbackResistDamage(actor: SR5Actor, damage: DamageType) {
        const isMatrix = damage.type.value === 'matrix';
        // if the biofeedback isn't matrix damage, halve the damage to as per SR5 266
        const damageValue = isMatrix ? damage.value : Math.ceil(damage.value / 2);
        // if the biofeedback isn't matrix damage, provide an empty string so it is based on the state of hotsim
        const biofeedback = isMatrix ? damage.biofeedback : '';
        return MatrixRules.createBiofeedbackDamage(damageValue, actor.isUsingHotSim, biofeedback);
    },

    /**
     * Apply dumpshock to an actor and their persona (device).
     *
     * Dumpshock can´t be applied to actors not using VR.
     *
     * @param actor The actor that is affected by dumpshock.
     */
    getDumpshockDamage(actor: SR5Actor) {
        if (!actor.isUsingVR) return DataDefaults.createData('damage', { type: { base: 'stun', value: 'stun' } });

        return MatrixRules.dumpshockDamage(actor.isUsingHotSim);
    },
};
