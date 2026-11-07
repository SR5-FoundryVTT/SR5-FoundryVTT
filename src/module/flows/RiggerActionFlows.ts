import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { PhysicalResistTest, PhysicalResistTestData } from '@/module/tests/PhysicalResistTest';
import { ActiveSensorLockFlow } from './ActiveSensorLockFlow';
import { DamageApplicationFlow } from '@/module/actor/flows/DamageApplicationFlow';
import { DataDefaults } from '@/module/data/DataDefaults';
import { TestCreator } from '@/module/tests/TestCreator';
import type { DamageType } from '@/module/types/item/Action';

export const RIGGER_ACTION_IDS = {
    PIT_MANEUVER: 'fZF85kf04CQrV05s',
    RAMMING: 'nuqAIChUuGjet2ly',
    EMERGENCY_EXIT: 'crOluF36867RLGsf',
    EWAR_NOISE_REDUCTION: 'FR0zv1LJ3LajQr4V',
    CUT_OFF: 'aKHboc5xAtGckQYh',
    CATCH_UP_OR_BREAK_AWAY: '9yNH0EZJmhh48pHW'
} as const;

export function matchesActionId(
    item: SR5Item | undefined,
    sourceItemUuid: string | undefined,
    actionId: string,
    fallbackNames: string[],
    fallbackTitle?: string
): boolean {
    if (item?.id === actionId) return true;
    const compendiumSource = (item?._stats as any)?.compendiumSource as string | undefined;
    if (compendiumSource?.endsWith(actionId)) return true;
    const flagSourceId = (item?.flags as any)?.core?.sourceId as string | undefined;
    if (flagSourceId?.endsWith(actionId)) return true;
    if (sourceItemUuid?.endsWith(actionId)) return true;

    const name = (item?.name ?? fallbackTitle ?? '').toLowerCase();
    if (!name) return false;
    return fallbackNames.some(fb => name.includes(fb.toLowerCase()));
}

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

function getAttackerMovementSpeed(attacker: SR5Actor): number {
    const tokenDoc = attacker.getToken?.();
    const history = tokenDoc?.movementHistory ?? (tokenDoc as any)?.document?.movementHistory;
    if (Array.isArray(history) && history.length > 1) {
        if (typeof tokenDoc?.measureMovementPath === 'function') {
            const measured = tokenDoc.measureMovementPath(history)?.cost;
            if (typeof measured === 'number' && measured > 0) {
                return measured;
            }
        }
        const lastCost = (history.at(-1) as any)?.cost;
        if (typeof lastCost === 'number' && lastCost > 0) {
            return lastCost;
        }
    }
    if (attacker.isType('vehicle')) {
        if (attacker.statuses?.has('sr5run') || attacker.statuses?.has('sr5sprint')) {
            return attacker.system.movement?.run?.value ?? 20;
        }
        return attacker.system.movement?.walk?.value ?? attacker.system.movement?.run?.value ?? 20;
    }
    return 20;
}

async function executePhysicalResistTest(
    actor: SR5Actor,
    incomingDamage: DamageType,
    triggeringTest: SuccessTest
): Promise<number> {
    const action = DataDefaults.createData('action_roll', {
        ...PhysicalResistTest._getDefaultTestAction(),
        test: 'PhysicalResistTest',
    });
    const data = TestCreator._prepareTestDataWithAction(action, actor, {
        ...TestCreator._minimalTestData(),
        action,
        type: 'PhysicalResistTest',
    }) as PhysicalResistTestData;
    data.incomingDamage = incomingDamage;
    data.modifiedDamage = foundry.utils.duplicate(incomingDamage) as DamageType;

    const showDialog = Boolean(triggeringTest.evaluated && triggeringTest.data?.options?.showDialog && game.user);
    const showMessage = triggeringTest.data?.options?.showMessage ?? true;
    const resistTest = TestCreator.fromTestData(
        data,
        { actor, source: actor },
        { showDialog, showMessage }
    );
    if (!resistTest) return incomingDamage.value;

    resistTest.prepareBaseValues();
    resistTest.calculateBaseValues();
    await resistTest.execute();

    const hits = resistTest.hits?.value ?? 0;
    return Math.max(0, incomingDamage.value - hits);
}

/**
 * Multiplier based on the Ramming Damage Table (SR5 CRB p. 203)
 */
export function calculateRammingMultiplier(speedMetersPerTurn: number): number {
    if (speedMetersPerTurn <= 0) return 0;
    if (speedMetersPerTurn <= 10) return 0.5;
    if (speedMetersPerTurn <= 50) return 1;
    if (speedMetersPerTurn <= 200) return 2;
    if (speedMetersPerTurn <= 300) return 3;
    if (speedMetersPerTurn <= 500) return 5;
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

        // Process Evasion / Breaking Sensor Lock via Cut Off or Catch Up / Break Away
        await RiggerActionFlows.handleSensorLockEvasion(test);

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
     * When a defender succeeds on an opposed Cut Off or Catch Up / Break Away test against a locking attacker
     * (or an escaping target succeeds against a locking pursuer), remove the sensor lock from the locking attacker.
     */
    async handleSensorLockEvasion(test: SuccessTest) {
        if (!test.opposing || !(test instanceof OpposedTest) || !test.against) return;

        const againstItem = test.against.item;
        const sourceItemUuid = test.against.data?.sourceItemUuid ?? test.data?.sourceItemUuid;
        const againstTitle = test.against.data?.title;

        const isEvasionAction =
            matchesActionId(againstItem, sourceItemUuid, RIGGER_ACTION_IDS.CUT_OFF, ['cut off', 'cut-off', 'abdrängen'], againstTitle) ||
            matchesActionId(againstItem, sourceItemUuid, RIGGER_ACTION_IDS.CATCH_UP_OR_BREAK_AWAY, ['catch up', 'break away', 'aufholen', 'entkommen'], againstTitle);

        if (!isEvasionAction) return;

        const attacker = test.against.actor;
        const defender = test.actor;
        if (!attacker || !defender) return;

        if (test.success) {
            await ActiveSensorLockFlow.removeSensorLock(defender, attacker.uuid ?? undefined);
        } else {
            await ActiveSensorLockFlow.removeSensorLock(attacker, defender.uuid ?? undefined);
        }
    },

    /**
     * PIT Maneuver outcome: On defender failure, apply 'sr5spunOut' status effect to target vehicle.
     */
    async handlePitManeuver(test: SuccessTest) {
        if (!test.opposing || !(test instanceof OpposedTest) || !test.against) return;

        const againstItem = test.against.item;
        const sourceItemUuid = test.against.data?.sourceItemUuid ?? test.data?.sourceItemUuid;
        const isPitManeuver = matchesActionId(
            againstItem,
            sourceItemUuid,
            RIGGER_ACTION_IDS.PIT_MANEUVER,
            ['pit maneuver', 'pit-maneuver'],
            test.against.data?.title
        );

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

        const isNoiseReduction = matchesActionId(
            test.item,
            test.data?.sourceItemUuid,
            RIGGER_ACTION_IDS.EWAR_NOISE_REDUCTION,
            ['e-war noise reduction', 'rauschunterdrückung'],
            test.data?.title
        );

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
        const sourceItemUuid = test.against.data?.sourceItemUuid ?? test.data?.sourceItemUuid;
        const isRamming = matchesActionId(
            againstItem,
            sourceItemUuid,
            RIGGER_ACTION_IDS.RAMMING,
            ['ramming', 'rammen'],
            test.against.data?.title
        );

        if (isRamming && !test.success) {
            const attacker = test.against.actor;
            const defender = test.actor;
            const netHits = test.againstNetHits?.value ?? Math.max(1, test.against.hits.value - test.hits.value);

            if (attacker && defender) {
                const attackerBody = attacker.findAttribute('body')?.value ?? 4;
                const speedMetersPerTurn = getAttackerMovementSpeed(attacker);
                const rammingDV = calculateRammingDV(attackerBody, speedMetersPerTurn, netHits);

                // Defender resists damage
                const defenderIncomingDamage = createPhysicalDamage(rammingDV);
                defenderIncomingDamage.ap.base = defender.isType('character') ? -6 : 0;
                defenderIncomingDamage.ap.value = defenderIncomingDamage.ap.base;

                const defenderDamageToApply = await executePhysicalResistTest(defender, defenderIncomingDamage, test);

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

                    rammerDamageToApply = await executePhysicalResistTest(attacker, rammerIncomingDamage, test);

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

        const isEmergencyExit = matchesActionId(
            test.item,
            test.data?.sourceItemUuid,
            RIGGER_ACTION_IDS.EMERGENCY_EXIT,
            ['emergency exit', 'notausstieg'],
            test.data?.title
        );

        if (isEmergencyExit && !test.success && test.actor) {
            const impactDamage = 6;
            const incomingDamage = createPhysicalDamage(impactDamage);

            const damageToApply = await executePhysicalResistTest(test.actor, incomingDamage, test);

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
