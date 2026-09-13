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
     * Launch Hardware repair workflow for a damaged matrix device item.
     */
    async runRepair(actor: SR5Actor, device: SR5Item) {
        if (!actor || !device) return;

        const hardwareSkill = actor.findActiveSkill('hardware');
        if (!hardwareSkill || (hardwareSkill.value || 0) <= 0) {
            ui.notifications?.warn(game.i18n.localize('SR5.Warnings.HardwareSkillRequired') || 'Hardware skill > 0 is required for matrix repairs.');
            return;
        }

        const condition = device.getCondition();
        if (!condition || condition.value <= 0) {
            ui.notifications?.info(game.i18n.localize('SR5.Infos.NoMatrixDamageToRepair') || 'Device has no matrix damage.');
            return;
        }

        const skillItem = actor.items.find(i => i.isType('skill') && i.name?.toLowerCase() === 'hardware');
        if (skillItem) {
            const test = await actor.testFromItem(skillItem);
            if (test) {
                await test.execute();
                const hits = Number(test.hits?.value ?? 0);
                if (hits > 0) {
                    await DamageApplicationFlow.addMatrixDamage(actor, createMatrixDamage(-hits));
                    ui.notifications?.info(game.i18n.format('SR5.Infos.MatrixDamageRepaired', {
                        hits: String(hits),
                        device: device.name || ''
                    }) || `Repaired ${hits} matrix damage on ${device.name || ''}.`);
                }
            }
        }
    }
};
