import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Token } from '@/module/token/SR5Token';
import { SR5TokenDocument } from '@/module/token/SR5TokenDocument';

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
            netHits
        }));
    }
};
