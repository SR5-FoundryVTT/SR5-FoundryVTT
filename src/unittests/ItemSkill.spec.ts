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
        // Guards provenance tracking so imported skillset items can still be identified later.
        it('stores non-empty source UUIDs on created skills and groups', async () => {
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

            const originalGetPackSkills = PackItemFlow.getPackSkills;
            const originalGetPackSkillgroups = PackItemFlow.getPackSkillgroups;

            PackItemFlow.getPackSkills = async () => [skillTemplate];
            PackItemFlow.getPackSkillgroups = async () => [groupTemplate];

            try {
                await SkillSetFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
                PackItemFlow.getPackSkillgroups = originalGetPackSkillgroups;
            }

            const createdSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;
            const createdGroup = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'group' && item.name === 'Firearms';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(createdSkill);
            assert.exists(createdGroup);
            assert.isString(createdSkill?.system.source.uuid);
            assert.isString(createdGroup?.system.source.uuid);
            assert.isNotEmpty(createdSkill?.system.source.uuid ?? '');
            assert.isNotEmpty(createdGroup?.system.source.uuid ?? '');
        });

        // Guards group-derived skill creation so grouped skills inherit the effective group value.
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

        // Guards against losing group-provided skills when a skillset defines only groups.
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

        // Guards skillset application so configured skill specializations survive into owned skills.
        it('applies configured skill set specializations to created skill items', async () => {
            const originalGetPackSkills = PackItemFlow.getPackSkills;
            const originalGetPackSkillgroups = PackItemFlow.getPackSkillgroups;

            try {
                // monkey patch pack flows to avoid default skillset application from interfering.
                PackItemFlow.getPackSkills = async () => [];
                PackItemFlow.getPackSkillgroups = async () => [];

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

                PackItemFlow.getPackSkills = async () => [skillTemplate];

                await SkillSetFlow.applySkillSetToActor(actor, skillSet);

                const createdSkill = actor.items.find(item => {
                    return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
                }) as SR5Item<'skill'> | undefined;

                assert.exists(createdSkill);
                assert.deepEqual(createdSkill?.system.skill.specializations.map(specialization => specialization.name), ['Semi-Automatics', 'Revolvers']);
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
                PackItemFlow.getPackSkillgroups = originalGetPackSkillgroups;
            }
        });

        // Guards default skillset application from duplicating an already owned skill.
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

        // Guards actor duplication from re-running default skillset seeding on copied actors.
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

    describe('SkillSetFlow.removeSkillSet', () => {
        // Guards skillset removal from clearing the flag while leaving unrelated manual skills untouched.
        it('clears the applied skillset while keeping unrelated skills in place', async () => {
            const skillSet = await factory.createItem({
                type: 'skill',
                name: 'Test Skill Set',
                system: {
                    type: 'set',
                },
            });

            const actor = await factory.createActor({ type: 'character' });

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

            const originalGetPackSkills = PackItemFlow.getPackSkills;
            const originalGetPackSkillgroups = PackItemFlow.getPackSkillgroups;

            PackItemFlow.getPackSkills = async () => [skillTemplate];
            PackItemFlow.getPackSkillgroups = async () => [groupTemplate];

            try {
                await SkillSetFlow.applySkillSetToActor(actor, skillSet);
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
                PackItemFlow.getPackSkillgroups = originalGetPackSkillgroups;
            }

            await actor.createEmbeddedDocuments('Item', [
                {
                    type: 'skill',
                    name: 'Sneaking',
                    system: {
                        type: 'skill',
                        skill: {
                            category: 'active',
                        },
                    },
                },
                {
                    type: 'skill',
                    name: 'Stealth',
                    system: {
                        type: 'group',
                        group: {
                            skills: ['Sneaking'],
                            rating: 2,
                        },
                    },
                },
            ]);

            await SkillSetFlow.removeSkillSet(actor);

            assert.strictEqual(actor.system.skillset, '');
            const unrelatedSkill = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Sneaking';
            }) as SR5Item<'skill'> | undefined;
            const unrelatedGroup = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'group' && item.name === 'Stealth';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(unrelatedSkill);
            assert.exists(unrelatedGroup);
        });
    });

    describe('SkillSelectionFlow.getSkillSelection', () => {
        // Guards item sheets from losing their current value when the selected skill is no longer in the pack.
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

        it('injects a selected missing skill using canonical keys for action selectors', async () => {
            const originalGetPackSkills = PackItemFlow.getPackSkills;
            PackItemFlow.getPackSkills = async () => [];

            try {
                const skills = await SkillSelectionFlow.getSkillSelection(undefined, {
                    categories: ['active'],
                    selectedSkills: ['Custom Missing Skill'],
                    valueType: 'key',
                });

                assert.property(skills, 'custom_missing_skill');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });

        // Guards owned item sheets from breaking when an actor still references a missing pack skill.
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

        // Documents that the selector stays permissive while still preserving the currently chosen skill.
        it('keeps pack skills available while ensuring the current skill remains selectable', async () => {
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
                assert.property(skills, 'Automatics');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });

        it('returns canonical skill keys for action selectors', async () => {
            const actor = await factory.createActor({ type: 'character' });
            const firstSkill = await factory.createItem({
                type: 'skill',
                name: 'Heavy Weapons',
                system: {
                    type: 'skill',
                    skill: {
                        category: 'active',
                    },
                },
            });
            const secondSkill = await factory.createItem({
                type: 'skill',
                name: 'Pilot Ground Craft',
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
                    categories: ['active'],
                    selectedSkills: ['Pilot Ground Craft'],
                    valueType: 'key',
                });

                assert.property(skills, 'heavy_weapons');
                assert.property(skills, 'pilot_ground_craft');
                assert.notProperty(skills, 'Heavy Weapons');
            } finally {
                PackItemFlow.getPackSkills = originalGetPackSkills;
            }
        });
    });

    describe('SkillGroupFlow.syncSkillItemGroups', () => {
        // Guards derived actor skills from drifting away from their owning group rating.
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

        // Guards re-sync after edits so changing a group updates the linked owned skills too.
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
        // Documents that derived skill fields currently do not carry the configured item limit value.
        it('does not expose configured skill limits on the derived skill field', async () => {
            const actor = await factory.createActor({ type: 'character' });

            const limit = 'physical';
            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Pistols',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                        limit: {
                            attribute: limit,
                        },
                    },
                },
            }]);

            const skill = actor.getSkill('Pistols');

            assert.exists(skill);
            assert.strictEqual(skill?.limit, limit);
        });

        // Guards roll data so actions still use explicit skill limits before falling back to attribute defaults.
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

        // Guards skill action storage so runtime tests can use canonical skill keys without losing actor lookup.
        it('stores canonical skill keys in action data and resolves them during actor lookup', async () => {
            const actor = await factory.createActor({ type: 'character' });

            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Heavy Weapons',
                system: {
                    type: 'skill',
                    skill: {
                        attribute: 'agility',
                    },
                },
            }]);

            const skillByKey = actor.getSkill('heavy_weapons');
            const actionByName = actor.skillActionData('Heavy Weapons');
            const actionByKey = actor.skillActionData('heavy_weapons');

            assert.exists(skillByKey);
            assert.strictEqual(skillByKey?.name, 'Heavy Weapons');
            assert.exists(actionByName);
            assert.exists(actionByKey);
            assert.strictEqual(actionByName?.skill, 'heavy_weapons');
            assert.strictEqual(actionByKey?.skill, 'heavy_weapons');
        });
    });
};
