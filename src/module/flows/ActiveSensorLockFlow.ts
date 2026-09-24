import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Token } from '@/module/token/SR5Token';
import { SR5TokenDocument } from '@/module/token/SR5TokenDocument';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';

const SENSOR_TARGETING_ACTION_ID = 'uWCPJNZNvGeCJkbl';

function isSensorTargetingItem(item?: any, title?: string): boolean {
    if (item?.id === SENSOR_TARGETING_ACTION_ID || item?.flags?.core?.sourceId?.includes(SENSOR_TARGETING_ACTION_ID)) return true;
    const name = (item?.name ?? title ?? '').toLowerCase();
    return name.includes('active sensor') || name.includes('aktive zielerfassung');
}

export const ActiveSensorLockFlow = {
    /**
     * Apply Active Sensor Lock status effect to target actor/token with net hits attacker bonus.
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

        // Clean up any existing sensor lock effect from this attacker
        const existingEffects = targetActor.effects.filter(e => e.statuses.has('sr5sensorLock') || Boolean(e.getFlag('shadowrun5e', 'isSensorLock')));
        for (const e of existingEffects) {
            await e.delete();
        }

        const effectName = `${game.i18n.localize('SR5.Rigger.ActiveSensorLock')} (+${netHits})`;
        await targetActor.createEmbeddedDocuments('ActiveEffect', [{
            name: effectName,
            img: 'icons/svg/target.svg',
            origin: attacker.uuid,
            duration: { value: 1, units: 'rounds', expiry: 'roundStart' },
            statuses: ['sr5sensorLock'],
            flags: {
                shadowrun5e: {
                    isSensorLock: true,
                    attackerUuid: attacker.uuid,
                    netHits
                }
            },
            system: {
                targets: [
                    {
                        id: 'attackerBonus',
                        name: 'attackerBonus',
                        applyTo: 'test_target',
                        conditions: [
                            { type: 'tests', mode: 'include', values: ['RangedAttackTest', 'ThrownAttackTest'] },
                            { type: 'categories', mode: 'include', values: ['attack_ranged', 'attack_thrown'] },
                        ],
                    },
                ],
                changes: [
                    { key: 'data.pool', type: 'add', value: String(netHits), target: 'attackerBonus' },
                ],
            }
        }]);

        ui.notifications?.info(game.i18n.format('SR5.Rigger.ActiveSensorLockSuccess', {
            attacker: attacker.name,
            target: targetActor.name,
            netHits: String(netHits)
        }));
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
            const itemName = againstItem?.name ?? opposedTest.against.data.title ?? '';
            const isSensorTargeting = isSensorTargetingItem(againstItem, itemName);

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
        const itemName = test.item?.name ?? test.data.title ?? '';
        const isSensorTargeting = isSensorTargetingItem(test.item, itemName);
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
    }
};

