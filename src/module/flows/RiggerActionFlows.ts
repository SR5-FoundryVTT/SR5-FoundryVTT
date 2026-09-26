import { SR5Actor } from '@/module/actor/SR5Actor';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { ActiveSensorLockFlow } from './ActiveSensorLockFlow';
import { DamageApplicationFlow } from '@/module/actor/flows/DamageApplicationFlow';
import { DataDefaults } from '@/module/data/DataDefaults';
import { TestCreator } from '@/module/tests/TestCreator';
import type { DamageType } from '@/module/types/item/Action';

export const RIGGER_ACTION_IDS = {
    PIT_MANEUVER: 'fZF85kf04CQrV05s',
    RAMMING: 'nuqAIChUuGjet2ly',
    EMERGENCY_EXIT: 'crOluF36867RLGsf',
    EWAR_NOISE_REDUCTION: 'FR0zv1LJ3LajQr4V'
} as const;

function createPhysicalDamage(value: number): DamageType {
    return {
        base: value,
        value,
        changes: [],
        attribute: '',
        base_formula_operator: 'add',
        type: { base: 'physical', value: 'physical' },
        element: { base: '', value: '' },
        ap: { base: 0, value: 0, changes: [], attribute: '', base_formula_operator: 'add' },
        biofeedback: '',
        source: { actorId: '', itemId: '', itemName: '', itemType: '' },
        normal_weapon: false
    };
}

/**
 * Multiplier based on the Ramming Damage Table (SR5 CRB p. 203)
 */
export function calculateRammingMultiplier(speedMetersPerTurn: number): number {
    if (speedMetersPerTurn <= 0) return 0;
    if (speedMetersPerTurn <= 10) return 0.5;
    if (speedMetersPerTurn <= 50) return 1;
    if (speedMetersPerTurn <= 200) return 2;
    if (speedMetersPerTurn <= 500) return 3;
    return 10;
}

export function calculateRammingDV(attackerBody: number, speedMetersPerTurn: number, netHits: number): number {
    const mult = calculateRammingMultiplier(speedMetersPerTurn);
    const baseDV = Math.ceil(attackerBody * mult);
    return baseDV + Math.max(0, netHits);
}

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
        const againstId = againstItem?.id ?? test.against.data.sourceItemUuid?.split('.').pop() ?? '';
        const againstName = againstItem?.name ?? test.against.data.title ?? '';
        const isPitManeuver = againstId === RIGGER_ACTION_IDS.PIT_MANEUVER ||
            againstName.toLowerCase().includes('pit maneuver') ||
            againstName.toLowerCase().includes('pit-maneuver');

        if (isPitManeuver && !test.success) {
            const defender = test.actor;
            if (defender) {
                await defender.toggleStatusEffect('sr5spunOut', { active: true });
                ui.notifications?.info(game.i18n.format('SR5.Rigger.SpunOutInfo', {
                    target: defender.name
                }));
            }
        }
    },

    /**
     * Electronic Warfare: Noise Reduction outcome.
     * When successful, applies temporary ActiveEffect providing noise reduction equal to net hits.
     */
    async handleEWarNoiseReduction(test: SuccessTest) {
        if (test.opposing) return;

        const itemId = test.item?.id ?? test.data.sourceItemUuid?.split('.').pop() ?? '';
        const itemName = test.item?.name ?? test.data.title ?? '';
        const isNoiseReduction = itemId === RIGGER_ACTION_IDS.EWAR_NOISE_REDUCTION ||
            itemName.toLowerCase().includes('e-war noise reduction') ||
            itemName.toLowerCase().includes('rauschunterdrückung');

        if (isNoiseReduction && test.success && test.actor) {
            const netHits = test.netHits?.value ?? test.hits.value;
            if (netHits <= 0) return;

            // Apply active effect with 1 combat round duration
            await test.actor.createEmbeddedDocuments('ActiveEffect', [{
                name: game.i18n.localize('SR5.Rigger.EWarNoiseReductionEffect'),
                img: 'systems/shadowrun5e/dist/icons/redist/waveform.svg',
                origin: test.actor.uuid,
                duration: { value: 1, units: 'rounds', expiry: 'roundStart' },
                system: {
                    targets: [{ id: 'actor', applyTo: 'actor' }],
                    changes: [
                        { key: 'system.matrix.noise_reduction', type: 'add', value: String(netHits) }
                    ]
                }
            }]);

            ui.notifications?.info(game.i18n.format('SR5.Rigger.EWarNoiseReductionSuccess', {
                actor: test.actor.name,
                hits: String(netHits)
            }));
        }
    },

    /**
     * Ramming outcome: Calculate collision damage based on vehicle Body, Speed table (SR5 p. 203), and net hits.
     * Target rolls Damage Resistance Test (characters use Body + Armor - 6 AP).
     * Rammer resists half DV (rounded up) with 0 AP.
     */
    async handleRamming(test: SuccessTest) {
        if (!test.opposing || !(test instanceof OpposedTest) || !test.against) return;

        const againstItem = test.against.item;
        const againstId = againstItem?.id ?? test.against.data.sourceItemUuid?.split('.').pop() ?? '';
        const againstName = againstItem?.name ?? test.against.data.title ?? '';
        const isRamming = againstId === RIGGER_ACTION_IDS.RAMMING ||
            againstName.toLowerCase().includes('ramming') ||
            againstName.toLowerCase().includes('rammen');

        if (isRamming && !test.success) {
            const attacker = test.against.actor;
            const defender = test.actor;
            const netHits = test.againstNetHits?.value ?? Math.max(1, test.against.hits.value - test.hits.value);

            if (attacker && defender) {
                const attackerBody = attacker.findAttribute('body')?.value ?? 4;
                let speedMetersPerTurn = 20;
                if (attacker.isType('vehicle')) {
                    speedMetersPerTurn = attacker.system.movement?.run?.value ?? 20;
                }
                const rammingDV = calculateRammingDV(attackerBody, speedMetersPerTurn, netHits);

                // Defender resists damage
                const defenderIncomingDamage = createPhysicalDamage(rammingDV);
                defenderIncomingDamage.ap.base = defender.isType('character') ? -6 : 0;
                defenderIncomingDamage.ap.value = defenderIncomingDamage.ap.base;

                const defenderAction = DataDefaults.createData('action_roll', {
                    test: 'PhysicalResistTest',
                    armor: true,
                    attribute: 'body'
                });

                const defenderTest = await TestCreator.fromAction(defenderAction, defender, { showDialog: false, showMessage: true });
                let defenderDamageToApply = rammingDV;
                if (defenderTest) {
                    (defenderTest as any).data.incomingDamage = defenderIncomingDamage;
                    defenderTest.prepareBaseValues();
                    defenderTest.calculateBaseValues();
                    await defenderTest.execute();
                    const hits = defenderTest.hits?.value ?? 0;
                    defenderDamageToApply = Math.max(0, rammingDV - hits);
                }

                if (defenderDamageToApply > 0) {
                    await DamageApplicationFlow.addPhysicalDamage(defender, createPhysicalDamage(defenderDamageToApply));
                }

                // Rammer vehicle resists half DV (rounded up) with 0 AP
                const rammerDV = Math.ceil(rammingDV / 2);
                let rammerDamageToApply = 0;
                if (rammerDV > 0 && attacker.isType('vehicle')) {
                    const rammerIncomingDamage = createPhysicalDamage(rammerDV);
                    rammerIncomingDamage.ap.base = 0;
                    rammerIncomingDamage.ap.value = 0;

                    const rammerAction = DataDefaults.createData('action_roll', {
                        test: 'PhysicalResistTest',
                        armor: true,
                        attribute: 'body'
                    });

                    const rammerTest = await TestCreator.fromAction(rammerAction, attacker, { showDialog: false, showMessage: true });
                    rammerDamageToApply = rammerDV;
                    if (rammerTest) {
                        (rammerTest as any).data.incomingDamage = rammerIncomingDamage;
                        rammerTest.prepareBaseValues();
                        rammerTest.calculateBaseValues();
                        await rammerTest.execute();
                        const hits = rammerTest.hits?.value ?? 0;
                        rammerDamageToApply = Math.max(0, rammerDV - hits);
                    }

                    if (rammerDamageToApply > 0) {
                        await DamageApplicationFlow.addPhysicalDamage(attacker, createPhysicalDamage(rammerDamageToApply));
                    }
                }

                ui.notifications?.info(game.i18n.format('SR5.Rigger.RammingBothDamaged', {
                    attacker: attacker.name,
                    target: defender.name,
                    damage: String(defenderDamageToApply),
                    selfDamage: String(rammerDamageToApply)
                }));
            }
        }
    },

    /**
     * Emergency Exit outcome: Calculate falling/impact damage on failed bailout test and resist.
     */
    async handleEmergencyExit(test: SuccessTest) {
        if (test.opposing) return;

        const itemId = test.item?.id ?? test.data.sourceItemUuid?.split('.').pop() ?? '';
        const itemName = test.item?.name ?? test.data.title ?? '';
        const isEmergencyExit = itemId === RIGGER_ACTION_IDS.EMERGENCY_EXIT ||
            itemName.toLowerCase().includes('emergency exit') ||
            itemName.toLowerCase().includes('notausstieg');

        if (isEmergencyExit && !test.success && test.actor) {
            const impactDamage = 6;
            const incomingDamage = createPhysicalDamage(impactDamage);
            const action = DataDefaults.createData('action_roll', {
                test: 'PhysicalResistTest',
                armor: true,
                attribute: 'body'
            });

            const resistTest = await TestCreator.fromAction(action, test.actor, { showDialog: false, showMessage: true });
            let damageToApply = impactDamage;
            if (resistTest) {
                (resistTest as any).data.incomingDamage = incomingDamage;
                resistTest.prepareBaseValues();
                resistTest.calculateBaseValues();
                await resistTest.execute();
                const hits = resistTest.hits?.value ?? 0;
                damageToApply = Math.max(0, impactDamage - hits);
            }

            if (damageToApply > 0) {
                await DamageApplicationFlow.addPhysicalDamage(test.actor, createPhysicalDamage(damageToApply));
            }

            ui.notifications?.warn(game.i18n.format('SR5.Rigger.EmergencyExitFailure', {
                actor: test.actor.name,
                damage: String(damageToApply)
            }));
        }
    }
};
