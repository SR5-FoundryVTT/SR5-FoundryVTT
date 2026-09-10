import { SR5Actor } from '@/module/actor/SR5Actor';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { ActiveSensorLockFlow } from './ActiveSensorLockFlow';
import { DamageApplicationFlow } from '@/module/actor/flows/DamageApplicationFlow';

/**
 * Handles Rigger & Vehicle Action outcome flows and state/status/active effect applications.
 */
export const RiggerActionFlows = {
    /**
     * Process test completion and dispatch to specific rigger action handlers.
     */
    async processTestOutcome(test: SuccessTest) {
        if (!test) return;

        // Process Active Sensor Targeting
        await ActiveSensorLockFlow.processActiveSensorLock(test);

        // Process Opposed PIT Maneuver
        await RiggerActionFlows.handlePitManeuver(test);

        // Process E-War Noise Reduction
        await RiggerActionFlows.handleEWarNoiseReduction(test);

        // Process Opposed Ramming
        await RiggerActionFlows.handleRamming(test);

        // Process Emergency Exit
        await RiggerActionFlows.handleEmergencyExit(test);
    },

    /**
     * PIT Maneuver outcome: On defender failure, apply 'sr5spunOut' status effect to target vehicle.
     */
    async handlePitManeuver(test: SuccessTest) {
        if (!test.opposing || !(test instanceof OpposedTest) || !test.against) return;

        const againstItem = test.against.item;
        const itemName = againstItem?.name ?? test.against.data.title ?? '';
        const isPitManeuver = itemName.toLowerCase().includes('pit maneuver') || itemName.toLowerCase().includes('pit-maneuver') || itemName.toLowerCase() === 'pit';

        if (isPitManeuver && !test.success) {
            const defender = test.actor;
            if (defender) {
                await defender.toggleStatusEffect('sr5spunOut', { active: true });
                ui.notifications?.info(game.i18n.format('SR5.Rigger.SpunOutInfo', {
                    target: defender.name
                }) || `${defender.name} has spun out!`);
            }
        }
    },

    /**
     * E-War Noise Reduction outcome: On success, apply temporary noise reduction active effect.
     */
    async handleEWarNoiseReduction(test: SuccessTest) {
        if (test.opposing) return;

        const itemName = test.item?.name ?? test.data.title ?? '';
        const isNoiseReduction = itemName.toLowerCase().includes('e-war noise reduction') || itemName.toLowerCase().includes('rauschunterdrückung');

        if (isNoiseReduction && test.success && test.actor) {
            const netHits = test.netHits?.value ?? test.hits.value;
            if (netHits <= 0) return;

            // Apply active effect with 1 combat round duration
            await test.actor.createEmbeddedDocuments('ActiveEffect', [{
                name: game.i18n.localize('SR5.Action.EwarNoiseReduction') || 'E-War Noise Reduction',
                img: 'systems/shadowrun5e/dist/icons/redist/waveform.svg',
                origin: test.actor.uuid,
                duration: { rounds: 1, expiry: 'roundStart' },
                changes: [
                    { key: 'system.matrix.noise_reduction', mode: 2, value: String(netHits) }
                ]
            } as any]);

            ui.notifications?.info(game.i18n.format('SR5.Rigger.EWarNoiseReductionSuccess', {
                actor: test.actor.name,
                hits: String(netHits)
            }) || `${test.actor.name} gained +${netHits} Noise Reduction for 1 round.`);
        }
    },

    /**
     * Ramming outcome: Calculate collision damage based on vehicle Body, Speed difference, and net hits.
     */
    async handleRamming(test: SuccessTest) {
        if (!test.opposing || !(test instanceof OpposedTest) || !test.against) return;

        const againstItem = test.against.item;
        const itemName = againstItem?.name ?? test.against.data.title ?? '';
        const isRamming = itemName.toLowerCase().includes('ramming') || itemName.toLowerCase().includes('rammen');

        if (isRamming && !test.success) {
            const attacker = test.against.actor;
            const defender = test.actor;
            const netHits = test.againstNetHits?.value ?? Math.max(1, test.against.hits.value - test.hits.value);

            if (attacker && defender) {
                const attackerBody = (attacker as any).system?.attributes?.body?.value ?? (attacker as any).system?.body ?? 4;
                const rammingDamage = attackerBody + netHits;

                ui.notifications?.info(game.i18n.format('SR5.Rigger.RammingSuccess', {
                    attacker: attacker.name,
                    target: defender.name,
                    damage: String(rammingDamage)
                }) || `${attacker.name} rammed ${defender.name} dealing ${rammingDamage} physical damage!`);

                // Apply physical damage to defender vehicle
                await DamageApplicationFlow.addPhysicalDamage(defender, {
                    type: { base: 'physical', value: 'physical' },
                    base: rammingDamage,
                    value: rammingDamage
                } as any);
            }
        }
    },

    /**
     * Emergency Exit outcome: Calculate falling/impact damage on failed bailout test.
     */
    async handleEmergencyExit(test: SuccessTest) {
        if (test.opposing) return;

        const itemName = test.item?.name ?? test.data.title ?? '';
        const isEmergencyExit = itemName.toLowerCase().includes('emergency exit') || itemName.toLowerCase().includes('notausstieg');

        if (isEmergencyExit && !test.success && test.actor) {
            const impactDamage = 6;
            ui.notifications?.warn(game.i18n.format('SR5.Rigger.EmergencyExitFailure', {
                actor: test.actor.name,
                damage: String(impactDamage)
            }) || `${test.actor.name} failed emergency exit and suffers ${impactDamage} impact damage!`);

            await DamageApplicationFlow.addPhysicalDamage(test.actor, {
                type: { base: 'physical', value: 'physical' },
                base: impactDamage,
                value: impactDamage
            } as any);
        }
    }
};
