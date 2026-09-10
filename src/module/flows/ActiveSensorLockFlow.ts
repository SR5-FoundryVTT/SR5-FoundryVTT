import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Token } from '@/module/token/SR5Token';
import { SR5TokenDocument } from '@/module/token/SR5TokenDocument';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { OpposedTest } from '@/module/tests/OpposedTest';

export const ActiveSensorLockFlow = {
    /**
     * Apply Active Sensor Lock status effect to target actor/token with net hits penalty.
     */
    async applySensorLock(attacker: SR5Actor, target: SR5Actor | SR5Token | SR5TokenDocument, netHits: number) {
        if (!attacker || !target || netHits <= 0) return;

        const targetActor = (target instanceof SR5Actor)
            ? target
            : ((target as any).actor as SR5Actor);

        if (!targetActor) return;

        await targetActor.toggleStatusEffect('sr5sensorLock', { active: true });
        
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
            const isSensorTargeting = itemName.toLowerCase().includes('active sensor') || itemName.toLowerCase().includes('aktive zielerfassung');
            
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
        const isSensorTargeting = itemName.toLowerCase().includes('active sensor') || itemName.toLowerCase().includes('aktive zielerfassung');
        if (isSensorTargeting && test.success && !test.opposing) {
            const attacker = test.actor;
            const netHits = test.netHits?.value ?? test.hits.value;
            if (!attacker) return;

            const targets = test.targets && test.targets.length > 0 ? test.targets : (test as any).icon ? [(test as any).icon] : [];
            for (const target of targets) {
                await this.applySensorLock(attacker, target as any, netHits);
            }
        }
    }
};

