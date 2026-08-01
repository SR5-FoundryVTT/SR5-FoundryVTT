import { QuenchBatchContext } from '@ethaks/fvtt-quench';

import { SR5Actor } from '@/module/actor/SR5Actor';
import { CreateActorFlow } from '@/module/actor/flows/CreateActorFlow';
import { SkillGroupFlow } from '@/module/actor/flows/SkillGroupFlow';
import { SkillSetFlow } from '@/module/actor/flows/SkillSetFlow';
import { DataDefaults } from '@/module/data/DataDefaults';
import { SkillSelectionFlow } from '@/module/flows/SkillSelectionFlow';
import { ActionFlow } from '@/module/item/flows/ActionFlow';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SkillItemFlow } from '@/module/item/flows/SkillItemFlow';
import { SR5Item } from '@/module/item/SR5Item';
import { SR5TestFactory } from './utils';

export const itemSkillTesting = (context: QuenchBatchContext) => {
    // These tests build their skill sets by hand, so actors must start without any default skills.
    const factory = new SR5TestFactory({ skipDefaultSkills: true });
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
                });
                if (!duplicate) throw new Error('Actor clone failed during skill set duplicate test');

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

        // Guards spirit checkbox semantics so group rows can store ON/OFF as 1/0 via the shared rating flow.
        it('accepts boolean-style 1/0 ratings for skill groups through changeSkillRating', async () => {
            const actor = await factory.createActor({
                type: 'spirit',
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

            const groupItem = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'group' && item.name === 'Firearms';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(groupItem);

            await SkillItemFlow.changeSkillRating(actor, groupItem!.id!, 1);
            await SkillGroupFlow.syncSkillItemGroups(actor);

            const groupOn = actor.items.get(groupItem!.id!) as SR5Item<'skill'> | undefined;
            const pistolsOn = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(groupOn);
            assert.exists(pistolsOn);
            assert.strictEqual(groupOn?.system.group.rating, 1);
            assert.strictEqual(pistolsOn?.system.skill.rating, 1);

            await SkillItemFlow.changeSkillRating(actor, groupItem!.id!, 0);
            await SkillGroupFlow.syncSkillItemGroups(actor);

            const groupOff = actor.items.get(groupItem!.id!) as SR5Item<'skill'> | undefined;
            const pistolsOff = actor.items.find(item => {
                return item.isType('skill') && item.system.type === 'skill' && item.name === 'Pistols';
            }) as SR5Item<'skill'> | undefined;

            assert.exists(groupOff);
            assert.exists(pistolsOff);
            assert.strictEqual(groupOff?.system.group.rating, 0);
            assert.strictEqual(pistolsOff?.system.skill.rating, 0);
        });
    });

    describe('Skill limits', () => {
        // Documents that derived skill fields currently do not carry the configured item limit value.
        it('does not expose configured skill limits on the derived skill field', async () => {
            const actor = await factory.createActor({ type: 'character' });

            const limit = 'social';
            await actor.createEmbeddedDocuments('Item', [{
                type: 'skill',
                name: 'Test',
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

            const skill = actor.getSkill('Test');

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

        it('returns canonical skill keys for active effect skill selectors', async () => {
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

            const skills = ActionFlow.sortedActiveSkills(actor);

            assert.property(skills, 'heavy_weapons');
            assert.strictEqual(skills.heavy_weapons, 'Heavy Weapons');
            assert.notProperty(skills, 'Heavy Weapons');
        });
    });

    describe('CreateActorFlow.addDefaultSkillsetsToSources', () => {
        /** Mock skill sets and count item preparations. */
        const withSkillSets = async (
            sets: [string, string[]][],
            body: (context: { skillSetUuids: Record<string, string>, buildCount: () => number }) => Promise<void>,
        ) => {
            const originalGetAllPackSkillSets = PackItemFlow.getAllPackSkillSets;
            const originalPrepareSkills = PackItemFlow.prepareSkillsForSkillSet;
            const originalPrepareGroups = PackItemFlow.prepareSkillGroupsForSkillSet;

            const skillSetItems = new Map<string, string[]>();
            const skillSetUuids: Record<string, string> = {};
            const skillSets: SR5Item<'skill'>[] = [];
            const skillTemplates = new Map<string, SR5Item<'skill'>>();
            let builds = 0;

            for (const [actorType, skillNames] of sets) {
                const skillSet = await factory.createItem({
                    type: 'skill',
                    name: `${actorType} set`,
                    system: {
                        type: 'set',
                        set: {
                            skills: skillNames.map(name => ({ name, rating: 0 })),
                            groups: [],
                            default: { type: actorType as never },
                        },
                    },
                });

                skillSets.push(skillSet);
                skillSetUuids[actorType] = skillSet.uuid!;
                skillSetItems.set(skillSet.uuid!, skillNames);

                for (const name of skillNames) {
                    if (skillTemplates.has(name)) continue;
                    skillTemplates.set(name, await factory.createItem({
                        type: 'skill',
                        name,
                        system: { type: 'skill', skill: { category: 'active' } },
                    }));
                }
            }

            PackItemFlow.getAllPackSkillSets = async () => skillSets;
            PackItemFlow.prepareSkillsForSkillSet = async (skillSet) => {
                builds++;
                return (skillSetItems.get(skillSet.uuid!) ?? []).map(name => {
                    const source = skillTemplates.get(name)!.toObject();
                    foundry.utils.setProperty(source, 'system.source.uuid', skillSet.uuid!);
                    return source;
                });
            };
            PackItemFlow.prepareSkillGroupsForSkillSet = async () => [];

            try {
                await body({ skillSetUuids, buildCount: () => builds });
            } finally {
                PackItemFlow.getAllPackSkillSets = originalGetAllPackSkillSets;
                PackItemFlow.prepareSkillsForSkillSet = originalPrepareSkills;
                PackItemFlow.prepareSkillGroupsForSkillSet = originalPrepareGroups;
            }
        };

        const actorSource = (type: string, items: Item.CreateData[] = []) =>
            ({ name: `#QUENCH ${type}`, type, system: {}, items } as unknown as Actor.CreateData);

        const skillNames = (source: Actor.CreateData) =>
            (source.items as Item.CreateData[]).filter(item => item.type === 'skill').map(item => item.name);

        // Guards the bulk import optimization: one build per actor type, not per actor.
        it('builds a type\'s skill set once and gives every actor of that type the full list', async () => {
            await withSkillSets([['character', ['Pistols', 'Perception', 'Running']]], async ({ skillSetUuids, buildCount }) => {
                const sources = [actorSource('character'), actorSource('character'), actorSource('character')];

                await CreateActorFlow.addDefaultSkillsetsToSources(sources);

                assert.strictEqual(buildCount(), 1);
                for (const source of sources) {
                    assert.sameMembers(skillNames(source), ['Pistols', 'Perception', 'Running']);
                    assert.strictEqual(foundry.utils.getProperty(source, 'system.skillset'), skillSetUuids.character);
                }
            });
        });

        // Guards that each actor type keeps its own skill set, an ic gets far fewer skills.
        it('gives each actor type its own skill set within a mixed batch', async () => {
            const sets: [string, string[]][] = [
                ['character', ['Pistols', 'Perception', 'Running']],
                ['spirit', ['Assensing', 'Astral Combat']],
                ['ic', ['Computer', 'Hacking']],
            ];

            await withSkillSets(sets, async ({ skillSetUuids, buildCount }) => {
                const sources = [
                    actorSource('character'), actorSource('spirit'), actorSource('ic'),
                    actorSource('character'), actorSource('ic'),
                ];

                await CreateActorFlow.addDefaultSkillsetsToSources(sources);

                // One build per distinct type, not per actor.
                assert.strictEqual(buildCount(), 3);

                assert.sameMembers(skillNames(sources[0]), ['Pistols', 'Perception', 'Running']);
                assert.sameMembers(skillNames(sources[1]), ['Assensing', 'Astral Combat']);
                assert.sameMembers(skillNames(sources[2]), ['Computer', 'Hacking']);
                assert.sameMembers(skillNames(sources[4]), ['Computer', 'Hacking']);

                assert.strictEqual(foundry.utils.getProperty(sources[2], 'system.skillset'), skillSetUuids.ic);
                assert.notStrictEqual(foundry.utils.getProperty(sources[2], 'system.skillset'), skillSetUuids.character);
            });
        });

        it('skips actor types without a default skill set without looking them up again', async () => {
            await withSkillSets([['character', ['Pistols']]], async ({ buildCount }) => {
                const sources = [actorSource('vehicle'), actorSource('vehicle'), actorSource('character')];

                await CreateActorFlow.addDefaultSkillsetsToSources(sources);

                assert.strictEqual(buildCount(), 1);
                assert.lengthOf(skillNames(sources[0]), 0);
                assert.isUndefined(foundry.utils.getProperty(sources[0], 'system.skillset'));
                assert.sameMembers(skillNames(sources[2]), ['Pistols']);
            });
        });

        // Guards the Chummer defined subset, whose ratings must survive the top up.
        it('keeps an actor\'s own rated skill instead of the skill set duplicate', async () => {
            await withSkillSets([['character', ['Pistols', 'Perception']]], async () => {
                const ownPistols = {
                    name: 'Pistols',
                    type: 'skill' as const,
                    system: DataDefaults.baseSystemData('skill', {
                        type: 'skill',
                        skill: { category: 'active', rating: 6 },
                    }),
                } as unknown as Item.CreateData;
                const sources = [actorSource('character', [ownPistols])];

                await CreateActorFlow.addDefaultSkillsetsToSources(sources);

                const pistols = (sources[0].items as Item.CreateData[]).filter(item => item.name === 'Pistols');
                assert.lengthOf(pistols, 1);
                assert.strictEqual(foundry.utils.getProperty(pistols[0], 'system.skill.rating'), 6);
                assert.isEmpty(foundry.utils.getProperty(pistols[0], 'system.source.uuid') ?? '');
                assert.sameMembers(skillNames(sources[0]), ['Pistols', 'Perception']);
            });
        });

        // The prepared items are shared by every actor of a type, so each needs its own copy.
        it('gives each actor independent item data', async () => {
            await withSkillSets([['character', ['Pistols']]], async () => {
                const sources = [actorSource('character'), actorSource('character')];

                await CreateActorFlow.addDefaultSkillsetsToSources(sources);

                const [first] = sources[0].items as Item.CreateData[];
                foundry.utils.setProperty(first, 'system.skill.rating', 12);
                first.name = 'Mutated';

                const [second] = sources[1].items as Item.CreateData[];
                assert.strictEqual(second.name, 'Pistols');
                assert.strictEqual(foundry.utils.getProperty(second, 'system.skill.rating'), 0);
            });
        });

        it('leaves an already assigned skillset alone', async () => {
            await withSkillSets([['character', ['Pistols']]], async () => {
                const source = actorSource('character');
                foundry.utils.setProperty(source, 'system.skillset', 'Compendium.some.other.Item.abcdef1234567890');

                await CreateActorFlow.addDefaultSkillsetsToSources([source]);

                assert.lengthOf(skillNames(source), 0);
                assert.strictEqual(foundry.utils.getProperty(source, 'system.skillset'), 'Compendium.some.other.Item.abcdef1234567890');
            });
        });

        // Guards that moving the work out of _preCreate did not change the resulting actor.
        it('produces the same actor as the per document _preCreate flow', async () => {
            await withSkillSets([['character', ['Pistols', 'Perception']]], async () => {
                const source = actorSource('character');
                await CreateActorFlow.addDefaultSkillsetsToSources([source]);

                const fromSources = await factory.createActor(
                    { ...source, type: 'character' } as Parameters<typeof factory.createActor>[0],
                    { skipDefaultSkills: true },
                );
                // Opt back in to the _preCreate flow this batch's factory skips by default.
                const fromPreCreate = await factory.createActor({ type: 'character' }, { skipDefaultSkills: false });

                const names = (actor: SR5Actor) => actor.items.filter(item => item.type === 'skill').map(item => item.name);
                assert.sameMembers(names(fromSources), names(fromPreCreate));
                assert.strictEqual(fromSources.system.skillset, fromPreCreate.system.skillset);
            });
        });
    });

    describe('PackItemFlow pack cache', () => {
        /**
         * Counts pack reads while running the given test body and always restores the original
         * retrieval helper and cache state.
         */
        const withPackReadCounter = async (body: (reads: () => number) => Promise<void>) => {
            const originalGetPackDocuments = PackItemFlow.getPackDocuments;
            let reads = 0;

            PackItemFlow.getPackDocuments = (async (...args: Parameters<typeof originalGetPackDocuments>) => {
                reads++;
                return originalGetPackDocuments.apply(PackItemFlow, args);
            }) as typeof PackItemFlow.getPackDocuments;

            try {
                await body(() => reads);
            } finally {
                PackItemFlow.getPackDocuments = originalGetPackDocuments;
            }
        };

        // Guards the default behaviour, so pack edits during normal play are picked up immediately.
        it('reads the pack on every call while the cache is disabled', async () => {
            await withPackReadCounter(async (reads) => {
                await PackItemFlow.getPackSkills();
                await PackItemFlow.getPackSkills();

                assert.strictEqual(reads(), 2);
            });
        });

        // Guards the bulk import optimization, where hundreds of actors pull the same documents.
        it('reads the pack once per document type within a cache scope', async () => {
            await withPackReadCounter(async (reads) => {
                await PackItemFlow.withSkillPackCache(async () => {
                    const firstSkills = await PackItemFlow.getPackSkills();
                    const secondSkills = await PackItemFlow.getPackSkills();

                    assert.strictEqual(reads(), 1);
                    assert.deepEqual(firstSkills, secondSkills);

                    await PackItemFlow.getPackSkillgroups();
                    await PackItemFlow.getPackSkillgroups();
                    await PackItemFlow.getAllPackSkillSets();
                    await PackItemFlow.getAllPackSkillSets();
                });

                assert.strictEqual(reads(), 3);
            });
        });

        it('reads the pack again after the cache scope ends', async () => {
            await withPackReadCounter(async (reads) => {
                await PackItemFlow.withSkillPackCache(async () => {
                    await PackItemFlow.getPackSkills();
                });
                await PackItemFlow.getPackSkills();

                assert.strictEqual(reads(), 2);
            });
        });

        it('releases the cache when a scoped operation fails', async () => {
            await withPackReadCounter(async (reads) => {
                try {
                    await PackItemFlow.withSkillPackCache(async () => {
                        await PackItemFlow.getPackSkills();
                        throw new Error('Expected test failure');
                    });
                } catch (error) {
                    assert.strictEqual((error as Error).message, 'Expected test failure');
                }

                await PackItemFlow.getPackSkills();
                assert.strictEqual(reads(), 2);
            });
        });
    });
};
