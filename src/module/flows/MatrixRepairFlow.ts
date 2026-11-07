import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5Item } from '@/module/item/SR5Item';
import { DamageApplicationFlow } from '@/module/actor/flows/DamageApplicationFlow';
import type { DamageType } from '@/module/types/item/Action';

function createMatrixDamage(value: number): DamageType {
    return {
        base: value,
        value,
        changes: [],
        attribute: '',
        base_formula_operator: 'add',
        type: { base: 'matrix', value: 'matrix' },
        element: { base: '', value: '' },
        ap: { base: 0, value: 0, changes: [], attribute: '', base_formula_operator: 'add' },
        biofeedback: '',
        source: { actorId: '', itemId: '', itemName: '', itemType: '' },
        normal_weapon: false
    };
}

export const MatrixRepairFlow = {
    /**
     * Launch Hardware repair workflow for a damaged matrix device or vehicle.
     */
    async runRepair(actor: SR5Actor, device: SR5Item | SR5Actor) {
        if (!actor || !device) return;

        const hardwareSkill = actor.findActiveSkill('hardware');
        if (!hardwareSkill || (hardwareSkill.value || 0) <= 0) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.HardwareSkillRequired'));
            return;
        }

        const condition = typeof (device as SR5Item).getCondition === 'function'
            ? (device as SR5Item).getCondition()
            : (device as SR5Actor).getMatrixTrack?.();
        if (!condition || condition.value <= 0) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.NoMatrixDamageToRepair'));
            return;
        }

        const test = typeof (actor as any).rollActiveSkill === 'function'
            ? await (actor as any).rollActiveSkill('hardware')
            : await actor.rollSkill('hardware');
        if (test) {
            const hits = Number(test.hits?.value ?? 0);
            if (hits > 0) {
                if (device instanceof SR5Actor) {
                    const newDamage = Math.max(0, condition.value - hits);
                    await device.healDamage('matrix', hits);
                    await device.setMatrixDamage(newDamage);
                } else {
                    await DamageApplicationFlow._addDamageToDeviceTrack(createMatrixDamage(-hits), device);
                }
                ui.notifications?.info(game.i18n.format('SR5.Infos.MatrixDamageRepaired', {
                    hits: String(hits),
                    device: device.name || ''
                }));
            }
        }
    }
};
