import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Token } from '@/module/token/SR5Token';
import { SR5TokenDocument } from '@/module/token/SR5TokenDocument';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';
import { ModifiableValue } from '@/module/mods/ModifiableValue';

const SENSOR_TARGETING_ACTION_ID = 'uWCPJNZNvGeCJkbl';

function isSensorTargetingItem(item?: any, title?: string, sourceItemUuid?: string): boolean {
    if (
        item?.id === SENSOR_TARGETING_ACTION_ID ||
        item?._stats?.compendiumSource?.includes(SENSOR_TARGETING_ACTION_ID) ||
        item?.flags?.core?.sourceId?.includes(SENSOR_TARGETING_ACTION_ID) ||
        sourceItemUuid?.includes(SENSOR_TARGETING_ACTION_ID)
    ) {
        return true;
    }
    const name = (item?.name ?? title ?? '').toLowerCase();
    return name.includes('active sensor') || name.includes('aktive zielerfassung');
}

export const ActiveSensorLockFlow = {
    /**
     * Apply Active Sensor Lock status effect to target actor/token with net hits defense penalty.
     * SR5 Core p. 184: Target suffers a dice pool penalty equal to net hits on Defense tests against the locking attacker
     * until the target breaks the lock.
     */
    async applySensorLock(attacker: SR5Actor, target: SR5Actor | SR5Token | SR5TokenDocument, netHits: number) {
        if (!attacker || !target || netHits <= 0) return;

        let targetActor: SR5Actor | null = null;
        if (target instanceof SR5Actor) {
            targetActor = target;
        } else if (target instanceof SR5Token || target instanceof SR5TokenDocument) {
            targetActor = target.actor;
        }

        if (!targetActor) return;

        // Clean up any existing sensor lock effect on this target from this same attacker only
        const existingEffects = targetActor.effects.filter(e =>
            (e.statuses.has('sr5sensorLock') || Boolean(e.getFlag('shadowrun5e', 'isSensorLock'))) &&
            (e.origin === attacker.uuid || e.getFlag('shadowrun5e', 'attackerUuid') === attacker.uuid)
        );
        for (const e of existingEffects) {
            await e.delete();
        }

        const effectName = `${game.i18n.localize('SR5.Rigger.ActiveSensorLock')} (-${netHits})`;
        await targetActor.createEmbeddedDocuments('ActiveEffect', [{
            name: effectName,
            img: 'icons/svg/target.svg',
            origin: attacker.uuid,
            duration: {},
            statuses: ['sr5sensorLock'],
            flags: {
                shadowrun5e: {
                    isSensorLock: true,
                    attackerUuid: attacker.uuid,
                    netHits
                }
            }
        }]);

        ui.notifications?.info(game.i18n.format('SR5.Rigger.ActiveSensorLockSuccess', {
            attacker: attacker.name,
            target: targetActor.name,
            netHits: String(netHits)
        }));
    },

    /**
     * Apply Active Sensor Lock defense penalty (-netHits) when the locked target defends against the locking attacker.
     */
    applySensorLockDefensePenalty(test: SuccessTest) {
        if (!test || !test.opposing || !test.actor) return;

        const isDefense =
            test.hasTestCategory('defense') ||
            Boolean(test.testCategories?.includes('defense')) ||
            test.type === 'PhysicalDefenseTest';
        if (!isDefense) return;

        const opposedTest = test as OpposedTest;
        const againstActor = opposedTest.against?.actor;
        const againstActorUuid =
            againstActor?.uuid ||
            opposedTest.against?.data?.sourceActorUuid ||
            opposedTest.data?.against?.sourceActorUuid;
        if (!againstActorUuid) return;

        const attackerUuids = new Set<string>([againstActorUuid]);
        if (againstActor?.isType('vehicle') && againstActor.system.driver) {
            attackerUuids.add(againstActor.system.driver);
        }

        const lockEffect = test.actor.effects.find(e => {
            if (!e.getFlag('shadowrun5e', 'isSensorLock') && !e.statuses.has('sr5sensorLock')) return false;
            const effectAttacker = (e.getFlag('shadowrun5e', 'attackerUuid') as string | undefined) || e.origin || '';
            return attackerUuids.has(effectAttacker);
        });

        if (!lockEffect) return;

        const netHits = Number(lockEffect.getFlag('shadowrun5e', 'netHits')) || 0;
        if (netHits <= 0) return;

        ModifiableValue.addUnique(test.data.pool, game.i18n.localize('SR5.Rigger.ActiveSensorLock'), -netHits);
        ModifiableValue.calcTotal(test.data.pool);
    },

    /**
     * Process test completion for Active Sensor Targeting action and apply Active Sensor Lock on success.
     */
    async processActiveSensorLock(test: SuccessTest) {
        if (!test) return;

        // Case 1: Opposed test where defender attempted to avoid Active Sensor Targeting
        if (test.opposing && (test as OpposedTest).against) {
            const opposedTest = test as OpposedTest;
            const againstItem = opposedTest.against.item;
            const itemName = againstItem?.name ?? opposedTest.against.data?.title ?? '';
            const sourceItemUuid = opposedTest.against.data?.sourceItemUuid ?? opposedTest.data?.sourceItemUuid;
            const isSensorTargeting = isSensorTargetingItem(againstItem, itemName, sourceItemUuid);

            if (isSensorTargeting && !test.success) {
                const attacker = opposedTest.against.actor;
                const defender = test.actor;
                const netHits = opposedTest.againstNetHits?.value ?? Math.max(1, opposedTest.against.hits.value - test.hits.value);
                if (attacker && defender) {
                    await this.applySensorLock(attacker, defender, netHits);
                }
            }
            return;
        }

        // Case 2: Active test for Active Sensor Targeting (unopposed or before opposed roll)
        const itemName = test.item?.name ?? test.data?.title ?? '';
        const isSensorTargeting = isSensorTargetingItem(test.item, itemName, test.data?.sourceItemUuid);
        if (isSensorTargeting && test.success && !test.opposing) {
            const attacker = test.actor;
            const netHits = test.netHits?.value ?? test.hits.value;
            if (!attacker) return;

            const targets = test.targets ?? [];
            for (const target of targets) {
                if (target instanceof SR5Actor || target instanceof SR5TokenDocument) {
                    await this.applySensorLock(attacker, target, netHits);
                }
            }
        }
    },

    /**
     * Remove Active Sensor Lock status effect from a target actor/token (e.g. after successful evasion).
     * If attackerUuid is provided, only removes locks originating from that attacker.
     */
    async removeSensorLock(target: SR5Actor | SR5Token | SR5TokenDocument, attackerUuid?: string | null) {
        if (!target) return;
        let targetActor: SR5Actor | null = null;
        if (target instanceof SR5Actor) {
            targetActor = target;
        } else if (target instanceof SR5Token || target instanceof SR5TokenDocument) {
            targetActor = target.actor;
        }
        if (!targetActor) return;

        const lockEffects = targetActor.effects.filter(e => {
            const isLock = e.statuses.has('sr5sensorLock') || Boolean(e.getFlag('shadowrun5e', 'isSensorLock'));
            if (!isLock) return false;
            if (!attackerUuid) return true;
            return e.origin === attackerUuid || e.getFlag('shadowrun5e', 'attackerUuid') === attackerUuid;
        });
        for (const e of lockEffects) {
            await e.delete();
        }
    }
};
