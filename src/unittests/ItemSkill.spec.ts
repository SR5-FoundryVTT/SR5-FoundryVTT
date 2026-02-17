import { QuenchBatchContext } from '@ethaks/fvtt-quench';

import { ActorCreationFlow } from '@/module/actor/flows/ActorCreationFlow';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5TestFactory } from './utils';

export const itemSkillTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => {
        await factory.destroy();
    });

    describe('ActorCreationFlow.applySkillSetToActor', () => {
        it('applies skill group value to created skill items', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Test Skill Set',
                system: {
                    type: 'set',
                    set: {
                        skills: [{ name: 'Pistols', rating: 6 }],
                        groups: [{ name: 'Firearms', rating: 4 }],
                    },
                },
            });

            const skillTemplate = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: { type: 'skill' },
            });

            const groupTemplate = await factory.createItem({
                type: 'skill',
                name: 'Firearms',
                system: {
                    type: 'group',
                    group: {
                        skills: ['Pistols'],
                    },
                },
            });

            const originalGetSkillsForSkillSet = PackItemFlow.getSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.getSkillGroupsForSkillSet;

            PackItemFlow.getSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.getSkillGroupsForSkillSet = async () => [groupTemplate.toObject()];

            try {
                await ActorCreationFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.getSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.getSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }

            const createdSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(createdSkill);
            assert.strictEqual(createdSkill?.system.skill.group, 'Firearms');
        });
    });
};
