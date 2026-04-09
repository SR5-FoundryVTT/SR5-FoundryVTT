import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { DataDefaults } from '@/module/data/DataDefaults';
import { Migrator } from '@/module/migrator/Migrator';

export const Migrators = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    type LegacySkillTestData = Record<string, unknown>;
    type LegacySkillContainerTestData = LegacySkillTestData | { attribute?: string; value?: Record<string, LegacySkillTestData> };
    type LegacyActorSkillsTestData = {
        active: Record<string, LegacySkillTestData>;
        language: LegacySkillContainerTestData;
        knowledge: Record<string, LegacySkillContainerTestData>;
    };

    after(async () => {
        await factory.destroy();
    });

    describe('Version0_32_0 legacy skill migration', () => {
        it('migrates legacy actor skill fields into owned skill items without pack data', () => {
            const source = {
                _id: foundry.utils.randomID(16),
                _stats: { systemVersion: '0.31.5' },
                name: 'Legacy Character',
                type: 'character',
                items: [],
                effects: [],
                system: DataDefaults.baseSystemData('character'),
            } as Actor.CreateData & {
                _id: string;
                _stats: { systemVersion: string };
                items: Item.CreateData[];
                system: ReturnType<typeof DataDefaults.baseSystemData<'character'>>;
            };

            const legacySkills: LegacyActorSkillsTestData = {
                active: {
                    pistols: DataDefaults.createData('skill_field', {
                        base: 4,
                        value: 4,
                        attribute: 'agility',
                        canDefault: true,
                        group: 'Firearms',
                        specs: ['Revolvers'],
                        description: 'Legacy pistols description',
                        img: 'systems/shadowrun5e/dist/icons/skills/combat-pistols.svg',
                        link: 'SR5 Core 130',
                    }),
                    jd93k2_custom_skill: DataDefaults.createData('skill_field', {
                        name: 'Freestyle Gunnery',
                        base: 3,
                        value: 3,
                        attribute: 'agility',
                        canDefault: false,
                        specs: ['Trick Shots'],
                        img: 'icons/svg/target.svg',
                    }),
                },
                language: {
                    attribute: 'intuition',
                    value: {
                        a1b2c3d4: DataDefaults.createData('skill_field', {
                            name: 'Spanish',
                            base: 0,
                            value: 12,
                            canDefault: true,
                            isNative: true,
                            img: 'icons/svg/book.svg',
                        }),
                    },
                },
                knowledge: {
                    street: {
                        attribute: 'intuition',
                        value: {
                            f6g7h8i9: DataDefaults.createData('skill_field', {
                                name: 'Gang Politics',
                                base: 2,
                                value: 2,
                                canDefault: true,
                                specs: ['Redmond'],
                                description: 'Street knowledge',
                                img: 'icons/svg/eye.svg',
                            }),
                        },
                    },
                    academic: { attribute: 'logic', value: {} },
                    professional: { attribute: 'logic', value: {} },
                    interests: { attribute: 'intuition', value: {} },
                },
            };

            foundry.utils.setProperty(source, 'system.skills', legacySkills);

            const migrated = Migrator.migrate('Actor', source);

            assert.isTrue(migrated);
            assert.lengthOf(source.items, 4);

            const pistols = source.items.find(item => item.type === 'skill' && item.name === 'Pistols') as Item.CreateData | undefined;
            assert.exists(pistols);
            assert.strictEqual(foundry.utils.getProperty(pistols, 'system.skill.category'), 'active');
            assert.strictEqual(foundry.utils.getProperty(pistols, 'system.skill.rating'), 4);
            assert.strictEqual(foundry.utils.getProperty(pistols, 'system.skill.defaulting'), true);
            assert.strictEqual(foundry.utils.getProperty(pistols, 'system.skill.group'), '');
            assert.deepEqual(foundry.utils.getProperty(pistols, 'system.skill.specializations'), [{ name: 'Revolvers' }]);
            assert.strictEqual(foundry.utils.getProperty(pistols, 'system.description.source'), 'SR5 Core 130');
            assert.strictEqual(pistols?.img, 'systems/shadowrun5e/dist/icons/skills/combat-pistols.svg');
            assert.strictEqual(pistols?.name, 'Pistols');

            const customSkill = source.items.find(item => item.type === 'skill' && item.name === 'Freestyle Gunnery') as Item.CreateData | undefined;
            assert.exists(customSkill);
            assert.deepEqual(foundry.utils.getProperty(customSkill, 'system.skill.specializations'), [{ name: 'Trick Shots' }]);
            assert.strictEqual(customSkill?.img, 'icons/svg/target.svg');

            const languageSkill = source.items.find(item => item.type === 'skill' && item.name === 'Spanish') as Item.CreateData | undefined;
            assert.exists(languageSkill);
            assert.strictEqual(foundry.utils.getProperty(languageSkill, 'system.skill.category'), 'language');
            assert.strictEqual(foundry.utils.getProperty(languageSkill, 'system.skill.rating'), 12);
            assert.strictEqual(foundry.utils.getProperty(languageSkill, 'system.skill.attribute'), 'intuition');
            assert.strictEqual(foundry.utils.getProperty(languageSkill, 'system.skill.defaulting'), false);
            assert.strictEqual(foundry.utils.getProperty(languageSkill, 'system.skill.language.isNative'), true);

            const knowledgeSkill = source.items.find(item => item.type === 'skill' && item.name === 'Gang Politics') as Item.CreateData | undefined;
            assert.exists(knowledgeSkill);
            assert.strictEqual(foundry.utils.getProperty(knowledgeSkill, 'system.skill.category'), 'knowledge');
            assert.strictEqual(foundry.utils.getProperty(knowledgeSkill, 'system.skill.knowledgeType'), 'street');
            assert.strictEqual(foundry.utils.getProperty(knowledgeSkill, 'system.skill.attribute'), 'intuition');
            assert.strictEqual(foundry.utils.getProperty(knowledgeSkill, 'system.skill.defaulting'), false);
            assert.strictEqual(knowledgeSkill?.img, 'icons/svg/eye.svg');
            assert.deepEqual(foundry.utils.getProperty(source, 'system.skills'), {});
        });

        it('migrates missing language and knowledge skills without duplicating existing skill items', () => {
            const source = {
                _id: foundry.utils.randomID(16),
                _stats: { systemVersion: '0.31.5' },
                name: 'Migrated Character',
                type: 'character',
                items: [{
                    _id: foundry.utils.randomID(16),
                    name: 'Pistols',
                    type: 'skill',
                    system: DataDefaults.baseSystemData('skill', {
                        type: 'skill',
                        skill: {
                            category: 'active',
                            attribute: 'agility',
                            rating: 4,
                        },
                    }),
                }],
                effects: [],
                system: DataDefaults.baseSystemData('character'),
            } as Actor.CreateData & {
                _id: string;
                _stats: { systemVersion: string };
                items: Item.CreateData[];
                system: ReturnType<typeof DataDefaults.baseSystemData<'character'>>;
            };

            const legacySkills: LegacyActorSkillsTestData = {
                active: {
                    pistols: DataDefaults.createData('skill_field', { base: 4, attribute: 'agility' }),
                },
                language: {
                    p4q5r6s7: DataDefaults.createData('skill_field', {
                        name: 'Spanish',
                        value: 3,
                        isNative: false,
                    }),
                },
                knowledge: {
                    street: {
                        t8u9v0w1: DataDefaults.createData('skill_field', {
                            name: 'Ork Underground',
                            base: 2,
                        }),
                    },
                    academic: {},
                    professional: {},
                    interests: {},
                },
            };

            foundry.utils.setProperty(source, 'system.skills', legacySkills);

            const migrated = Migrator.migrate('Actor', source);

            assert.isTrue(migrated);
            assert.lengthOf(source.items, 3);
            assert.lengthOf(source.items.filter(item => item.type === 'skill' && item.name === 'Pistols'), 1);

            const spanish = source.items.find(item => item.type === 'skill' && item.name === 'Spanish');
            assert.exists(spanish);
            assert.strictEqual(foundry.utils.getProperty(spanish, 'system.skill.category'), 'language');

            const knowledge = source.items.find(item => item.type === 'skill' && item.name === 'Ork Underground');
            assert.exists(knowledge);
            assert.strictEqual(foundry.utils.getProperty(knowledge, 'system.skill.category'), 'knowledge');
            assert.strictEqual(foundry.utils.getProperty(knowledge, 'system.skill.knowledgeType'), 'street');
            assert.deepEqual(foundry.utils.getProperty(source, 'system.skills'), {});
        });
    });

};