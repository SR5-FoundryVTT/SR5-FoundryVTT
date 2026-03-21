import { QuenchBatchContext } from '@ethaks/fvtt-quench';

import { SR5Actor } from '@/module/actor/SR5Actor';
import { SkillGroupFlow } from '@/module/actor/flows/SkillGroupFlow';
import { SkillSetFlow } from '@/module/actor/flows/SkillSetFlow';
import { SkillSelectionFlow } from '@/module/flows/SkillSelectionFlow';
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

    describe('SkillSetFlow.applySkillSetToActor', () => {
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

            const originalGetSkillsForSkillSet = PackItemFlow.prepareSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.prepareSkillGroupsForSkillSet;

            PackItemFlow.prepareSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => {
                const groupData = groupTemplate.toObject();
                groupData.system.group.rating = 4;
                return [groupData];
            };

            try {
                await SkillSetFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }

            const createdSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(createdSkill);
            assert.strictEqual(createdSkill?.system.skill.group, 'Firearms');
            assert.strictEqual(createdSkill?.system.skill.rating, 4);

            const derivedSkill = actor.getSkill('Pistols');
            assert.exists(derivedSkill);
            assert.strictEqual(derivedSkill?.base, 4);
        });

        it('adds skills contributed by configured skill groups even without direct skill entries', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Grouped Skills Only',
                system: {
                    type: 'set',
                    set: {
                        skills: [],
                        groups: [{ name: 'Firearms', rating: 4 }],
                    },
                },
            });

            const skillTemplate = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
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

            const originalGetSkillsForSkillSet = PackItemFlow.prepareSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.prepareSkillGroupsForSkillSet;

            PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => {
                const groupData = groupTemplate.toObject();
                groupData.system.group.rating = 4;
                return [groupData];
            };

            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [skillTemplate];

            try {
                await SkillSetFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
                PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }

            const createdSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(createdSkill);
            assert.strictEqual(createdSkill?.system.skill.group, 'Firearms');
            assert.strictEqual(createdSkill?.system.skill.rating, 4);
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

            const originalGetSkillsForSkillSet = PackItemFlow.prepareSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.prepareSkillGroupsForSkillSet;

            PackItemFlow.prepareSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => [];

            try {
                await SkillSetFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }

            const createdSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(createdSkill);
            assert.deepEqual(createdSkill?.system.skill.specializations.map(specialization => specialization.name), ['Semi-Automatics', 'Revolvers']);
        });

        it('does not add a duplicate skill item when default skillset application matches an existing actor skill', async () => {
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Default Character Skill Set',
                system: {
                    type: 'set',
                    set: {
                        skills: [{ name: 'Pistols', rating: 6 }],
                        groups: [],
                        default: {
                            type: ['character'] as never,
                        },
                    },
                },
            });

            const skillTemplate = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
            });

            const originalGetAllPackSkillSets = PackItemFlow.getAllPackSkillSets;
            const originalGetSkillsForSkillSet = PackItemFlow.prepareSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.prepareSkillGroupsForSkillSet;

            PackItemFlow.getAllPackSkillSets = async () => [skillSet];
            PackItemFlow.prepareSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => [];

            try {
                const actor = await factory.createActor({
                    type: 'character',
                    items: [{
                        name: 'Pistols',
                        type: 'skill',
                        system: {
                            type: 'skill',
                            skill: {
                                category: 'active',
                            },
                        },
                    }],
                });

                const pistolsItems = actor.items.filter(item => {
                    return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
                });

                assert.lengthOf(pistolsItems, 1);
                assert.exists(actor.getSkill('Pistols'));
            } finally {
                PackItemFlow.getAllPackSkillSets = originalGetAllPackSkillSets;
                PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }
        });

        it('does not apply default skillset items when duplicating an actor', async () => {
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Default Character Skill Set',
                system: {
                    type: 'set',
                    set: {
                        skills: [{ name: 'Pistols', rating: 6 }],
                        groups: [],
                        default: {
                            type: ['character'] as never,
                        },
                    },
                },
            });

            const skillTemplate = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
            });

            const originalGetAllPackSkillSets = PackItemFlow.getAllPackSkillSets;
            const originalGetSkillsForSkillSet = PackItemFlow.prepareSkillsForSkillSet;
            const originalGetSkillGroupsForSkillSet = PackItemFlow.prepareSkillGroupsForSkillSet;

            PackItemFlow.getAllPackSkillSets = async () => [];
            PackItemFlow.prepareSkillsForSkillSet = async () => [skillTemplate.toObject()];
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => [];

            try {
                const actor = await factory.createActor({ type: 'character' });
                assert.lengthOf(actor.items, 0);

                PackItemFlow.getAllPackSkillSets = async () => [skillSet];

                const duplicate = await actor.clone({
                    name: 'Duplicated Character',
                    type: 'character',
                }, {
                    save: true,
                    addSource: true,
                }) as SR5Actor<'character'>;

                factory.actors.push(duplicate);

                const pistolsItems = duplicate.items.filter(item => {
                    return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
                });

                assert.lengthOf(duplicate.items, 0);
                assert.lengthOf(pistolsItems, 0);
            } finally {
                PackItemFlow.getAllPackSkillSets = originalGetAllPackSkillSets;
                PackItemFlow.prepareSkillsForSkillSet = originalGetSkillsForSkillSet;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalGetSkillGroupsForSkillSet;
            }
        });
    });

    describe('SkillSelectionFlow.getSkillSelection', () => {
        it('injects a selected missing skill for sidebar item sheets', async () => {
            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [];

            try {
                const skills = await SkillSelectionFlow.getSkillSelection(undefined, {
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
                const skills = await SkillSelectionFlow.getSkillSelection(actor, {
                    categories: ['active'],
                    selectedSkills: ['Custom Missing Skill'],
                });

                assert.property(skills, 'Custom Missing Skill');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });

        it('excludes already selected skillset skills while keeping the current skill selectable', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const firstSkill = await factory.createItem({
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
            });
            const secondSkill = await factory.createItem({
                type: 'skill',
                name: 'Automatics',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
            });

            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [firstSkill, secondSkill];

            try {
                const skills = await SkillSelectionFlow.getSkillSelection(actor, {
                    selectedSkills: ['Pistols']
                });

                assert.property(skills, 'Pistols');
                assert.notProperty(skills, 'Automatics');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });
    });

    describe('SkillGroupFlow.syncSkillItemGroups', () => {
        it('applies group ratings to derived skill fields', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        agility: { base: 3 },
                    },
                },
            });

            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Firearms',
                    system: {
                        type: 'group',
                        group: {
                            rating: 4,
                            skills: ['Pistols'],
                        },
                    },
                },
                {
                    type: 'skill',
                    name: 'Pistols',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'agility',
                            rating: 1,
                        },
                    },
                },
            ]);

            await SkillGroupFlow.syncSkillItemGroups(actor);

            const skillItem = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(skillItem);
            assert.strictEqual(skillItem?.system.skill.group, 'Firearms');
            assert.strictEqual(skillItem?.system.skill.rating, 4);

            const derivedSkill = actor.getSkill('Pistols');
            assert.exists(derivedSkill);
            assert.strictEqual(derivedSkill?.base, 4);
            assert.strictEqual(derivedSkill?.value, 4);
            assert.strictEqual(actor.getPool('Pistols'), 7);
        });

        it('updates grouped skill item ratings when the group rating changes', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    attributes: {
                        agility: { base: 3 },
                    },
                },
            });

            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Firearms',
                    system: {
                        type: 'group',
                        group: {
                            rating: 2,
                            skills: ['Pistols'],
                        },
                    },
                },
                {
                    type: 'skill',
                    name: 'Pistols',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'agility',
                            rating: 1,
                        },
                    },
                },
            ]);

            await SkillGroupFlow.syncSkillItemGroups(actor);

            const groupItem = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'group' && item.name === 'Firearms';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(groupItem);
            await groupItem?.update({ system: { group: { rating: 5 } } });
            await SkillGroupFlow.syncSkillItemGroups(actor);

            const skillItem = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(skillItem);
            assert.strictEqual(skillItem?.system.skill.rating, 5);

            const derivedSkill = actor.getSkill('Pistols');
            assert.exists(derivedSkill);
            assert.strictEqual(derivedSkill?.base, 5);
            assert.strictEqual(derivedSkill?.value, 5);
            assert.strictEqual(actor.getPool('Pistols'), 8);
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
