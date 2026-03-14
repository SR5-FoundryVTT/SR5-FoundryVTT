import { QuenchBatchContext } from '@ethaks/fvtt-quench';

import { ActorCreationFlow } from '@/module/actor/flows/ActorCreationFlow';
import { SkillFlow } from '@/module/actor/flows/SkillFlow';
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

        it('applies configured skill set specializations to created skill items', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Test Skill Set',
                system: {
                    type: 'set',
                    set: {
                        skills: [{
                            name: 'Pistols',
                            rating: 6,
                            specializations: [{ name: 'Semi-Automatics' }, { name: 'Revolvers' }],
                        }],
                    },
                },
            });

            const skillTemplate = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: { type: 'skill' },
            });

            const originalGetSkillsForSkillSet = PackItemFlow.getSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.getSkillGroupsForSkillSet;

            PackItemFlow.getSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.getSkillGroupsForSkillSet = async () => [];

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
            assert.deepEqual(createdSkill?.system.skill.specializations.map(specialization => specialization.name), ['Semi-Automatics', 'Revolvers']);
        });
    });

    describe('SkillFlow.getSkillSelection', () => {
        it('injects a selected missing skill for sidebar item sheets', async () => {
            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [];

            try {
                const skills = await SkillFlow.getSkillSelection(undefined, {
                    categories: ['active'],
                    selectedSkills: ['Custom Missing Skill'],
                });

                assert.property(skills, 'Custom Missing Skill');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });

        it('injects a selected missing skill for owned item sheets', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [];

            try {
                const skills = await SkillFlow.getSkillSelection(actor, {
                    categories: ['active'],
                    selectedSkills: ['Custom Missing Skill'],
                });

                assert.property(skills, 'Custom Missing Skill');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });
    });

    describe('Skill limits', () => {
        it('derives configured skill limits instead of default attribute limit', async () => {
            const actor = await factory.createActor({ type: 'character' });

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        limit: {
                            // agility is a physical attribute and should derive physical limit
                            attribute: 'social',
                        },
                    },
                },
            }]);

            const skill = actor.getSkill('Pistols');

            assert.exists(skill);
            assert.strictEqual(skill?.limit, 'social');
        });

        it('prefers a configured skill limit and otherwise falls back to the attribute limit', async () => {
            const actor = await factory.createActor({ type: 'character' });

            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Pistols',
                    system: {
                        type: 'skill',
                        skill: {
                            attribute: 'agility',
                            limit: {
                                attribute: 'physical',
                            },
                        },
                    },
                },
                {
                    type: 'skill',
                    name: 'Perception',
                    system: {
                        type: 'skill',
                        skill: {
                            attribute: 'intuition',
                        },
                    },
                },
            ]);

            const pistolsAction = actor.skillActionData('Pistols');
            const perceptionAction = actor.skillActionData('Perception');

            assert.exists(pistolsAction);
            assert.strictEqual(pistolsAction?.limit.attribute, 'physical');
            assert.strictEqual(perceptionAction?.limit.attribute, 'mental');
        });
    });
};
