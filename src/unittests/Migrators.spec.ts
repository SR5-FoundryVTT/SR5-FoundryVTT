import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SR5TestFactory } from './utils';
import { DataDefaults } from '@/module/data/DataDefaults';
import { Migrator } from '@/module/migrator/Migrator';
import { VersionMigration } from '@/module/migrator/VersionMigration';
import { Version0_33_1 } from '@/module/migrator/versions/Version0_33_1';
import { Version0_36_0 } from 'src/module/migrator/versions/Version0_36_0';

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

    class TestMigration extends VersionMigration {
        readonly TargetVersion = '0.0.0' as const;

        remap(
            effect: unknown,
            keyMap: Readonly<Record<string, string>>,
        ) {
            this.migrateEffectChanges(effect, keyMap);
        }
    }

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

    describe('Version0_33_1 active effect key migration', () => {
        it('migrates terminal legacy .mod keys to .changes only', () => {
            const migrator = new Version0_33_1();
            const effect = {
                system: {
                    changes: [
                        { key: 'system.attributes.body.mod' },
                        { key: 'system.attributes.body.mods' },
                        { key: 'system.skills.active.pistols.mods' },
                        { key: 'system.modifiers.global' },
                        { key: 'system.foo.mod.bar' },
                        { key: 'system.foo.mods.bar' },
                    ],
                }
            };

            assert.isTrue(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.changes.map(change => change.key), [
                'system.attributes.body.changes',
                'system.attributes.body.mods',
                'system.skills.active.pistols.mods',
                'system.modifiers.global',
                'system.foo.mod.bar',
                'system.foo.mods.bar',
            ]);
        });

        it('ignores keys where .mod is not the terminal segment', () => {
            const migrator = new Version0_33_1();
            const effect = {
                system: {
                    changes: [
                        { key: 'system.modifiers.value' },
                        { key: 'system.foo.mod.bar' },
                    ],
                }
            };

            assert.isFalse(migrator.handlesActiveEffect(effect));
        });

        it('does not migrate non-ModifiableValue terminal .mod keys', () => {
            const migrator = new Version0_33_1();
            const effect = {
                system: {
                    changes: [
                        { key: 'data.action.mod' },
                        { key: 'data.action.opposed.mod' },
                        { key: 'data.action.opposed.resist.mod' },
                        { key: 'data.action.followed.mod' },
                        { key: 'system.action.mod' },
                        { key: 'system.action.opposed.mod' },
                        { key: 'system.action.opposed.resist.mod' },
                        { key: 'system.action.followed.mod' },
                        { key: 'system.armor.mod' },
                    ],
                },
            };

            assert.isFalse(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.changes.map(change => change.key), [
                'data.action.mod',
                'data.action.opposed.mod',
                'data.action.opposed.resist.mod',
                'data.action.followed.mod',
                'system.action.mod',
                'system.action.opposed.mod',
                'system.action.opposed.resist.mod',
                'system.action.followed.mod',
                'system.armor.mod',
            ]);
        });

        it('migrates legacy test data.modifiers keys to data.pool', () => {
            const migrator = new Version0_33_1();
            const effect = {
                system: {
                    applyTo: 'test_all',
                    changes: [
                        { key: 'data.modifiers' },
                        { key: 'data.modifiers.mod' },
                        { key: 'data.threshold' },
                    ],
                },
            };

            assert.isTrue(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.changes.map(change => change.key), [
                'data.pool',
                'data.pool',
                'data.threshold',
            ]);
        });

        it('does not migrate data.modifiers for non-test effects', () => {
            const migrator = new Version0_33_1();
            const effect = {
                system: {
                    applyTo: 'actor',
                    changes: [
                        { key: 'data.modifiers' },
                        { key: 'data.modifiers.mod' },
                    ],
                },
            };

            assert.isFalse(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.changes.map(change => change.key), [
                'data.modifiers',
                'data.modifiers.mod',
            ]);
        });
    });

    describe('VersionMigration active effect remap helper', () => {
        it('rewrites mapped keys and formula string value paths without evaluating math', () => {
            const migrator = new TestMigration();
            const keyMap = {
                'system.level': 'system.attributes.level',
                'system.modifiers.matrix_initiative': 'system.initiative.matrix.constant.base',
                'system.modifiers.matrix_initiative_dice': 'system.initiative.matrix.dice.base',
            };

            const effect = {
                system: {
                    changes: [
                        {
                            key: 'system.modifiers.matrix_initiative',
                            value: '(@system.modifiers.matrix_initiative + @system.level + @system.modifiers.matrix_initiative_dice)',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD
                        },
                        {
                            key: 'system.attributes.reaction',
                            value: '@system.attributes.reaction + @system.unknown.path',
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD
                        },
                        {
                            key: 'system.modifiers.matrix_initiative_dice',
                            value: 2,
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD
                        },
                        {
                            key: 'system.attributes.body',
                            value: 5,
                            mode: CONST.ACTIVE_EFFECT_MODES.ADD
                        },
                    ],
                },
            };

            migrator.remap(effect, keyMap);

            assert.strictEqual(effect.system.changes[0].key, 'system.initiative.matrix.constant.base');
            assert.strictEqual(
                effect.system.changes[0].value,
                '(@system.initiative.matrix.constant.base + @system.attributes.level + @system.initiative.matrix.dice.base)'
            );
            assert.strictEqual(typeof effect.system.changes[0].value, 'string');

            assert.strictEqual(effect.system.changes[1].key, 'system.attributes.reaction');
            assert.strictEqual(effect.system.changes[1].value, '@system.attributes.reaction + @system.unknown.path');

            assert.strictEqual(effect.system.changes[2].key, 'system.initiative.matrix.dice.base');
            assert.strictEqual(effect.system.changes[2].value, 2);

            assert.strictEqual(effect.system.changes[3].key, 'system.attributes.body');
            assert.strictEqual(effect.system.changes[3].value, 5);
        });
    });

    describe('Version0_35_0 spirit legacy migration', () => {
        const createSkillItem = (name: string, rating = 0): any => ({
            _id: foundry.utils.randomID(16),
            name,
            type: 'skill',
            system: DataDefaults.baseSystemData('skill', {
                type: 'skill',
                skill: {
                    category: 'active',
                    attribute: 'intuition',
                    rating,
                },
            }),
        });

        const createSpirit = (spiritType: string, force = 6): any => ({
            _id: foundry.utils.randomID(16),
            _stats: { systemVersion: '0.33.9' },
            name: 'Legacy Spirit',
            type: 'spirit',
            items: [] as any[],
            effects: [],
            system: DataDefaults.baseSystemData('spirit', {
                spiritType,
                attributes: { force: { base: force } },
            }),
        });

        it('migrates known spirit profiles to offsets, force applicability, formulae, and skill toggles', () => {
            const migrator = new Version0_36_0();
            const actor = createSpirit('air', 6);
            actor.items.push(createSkillItem('Assensing', 0), createSkillItem('Arcana', 4));

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.attributes.body.base, -2);
            assert.strictEqual(actor.system.attributes.agility.base, 3);
            assert.strictEqual(actor.system.attributes.reaction.base, 4);
            assert.strictEqual(actor.system.attributes.strength.base, -3);

            assert.strictEqual(actor.system.attributes.body.applies_special, true);
            assert.strictEqual(actor.system.attributes.intuition.applies_special, true);

            assert.strictEqual(actor.system.half_value_skill, false);
            assert.strictEqual(actor.system.initiative.meatspace.attribute_a, 'force');
            assert.strictEqual(actor.system.initiative.meatspace.attribute_b, 'force');
            assert.strictEqual(actor.system.initiative.meatspace.constant.base, 4);
            assert.strictEqual(actor.system.initiative.meatspace.dice.base, 2);
            assert.strictEqual(actor.system.initiative.astral.attribute_a, 'force');
            assert.strictEqual(actor.system.initiative.astral.attribute_b, 'force');
            assert.strictEqual(actor.system.initiative.astral.constant.base, 0);
            assert.strictEqual(actor.system.initiative.astral.dice.base, 3);

            const assensing = actor.items.find((item: any) => item.name === 'Assensing');
            const arcana = actor.items.find((item: any) => item.name === 'Arcana');
            assert.strictEqual(foundry.utils.getProperty(assensing, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(arcana, 'system.skill.rating'), 0);
        });

        it('migrates watcher half-value profile, force off attributes, and initiative dice variations', () => {
            const migrator = new Version0_36_0();
            const actor = createSpirit('watcher', 6);
            actor.items.push(createSkillItem('Assensing', 0), createSkillItem('Unarmed Combat', 2));

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.half_value_skill, true);
            assert.strictEqual(actor.system.attributes.body.applies_special, false);
            assert.strictEqual(actor.system.attributes.agility.applies_special, false);
            assert.strictEqual(actor.system.attributes.reaction.applies_special, false);
            assert.strictEqual(actor.system.attributes.strength.applies_special, false);
            assert.strictEqual(actor.system.attributes.logic.applies_special, true);

            assert.strictEqual(actor.system.attributes.willpower.base, -2);
            assert.strictEqual(actor.system.attributes.logic.base, -2);
            assert.strictEqual(actor.system.attributes.intuition.base, -2);
            assert.strictEqual(actor.system.attributes.charisma.base, -2);

            assert.strictEqual(actor.system.initiative.meatspace.attribute_a, '');
            assert.strictEqual(actor.system.initiative.meatspace.attribute_b, '');
            assert.strictEqual(actor.system.initiative.meatspace.constant.base, 0);
            assert.strictEqual(actor.system.initiative.meatspace.dice.base, 0);
            assert.strictEqual(actor.system.initiative.astral.attribute_a, 'force');
            assert.strictEqual(actor.system.initiative.astral.attribute_b, 'force');
            assert.strictEqual(actor.system.initiative.astral.constant.base, 0);
            assert.strictEqual(actor.system.initiative.astral.dice.base, 1);

            const assensing = actor.items.find((item: any) => item.name === 'Assensing');
            const unarmedCombat = actor.items.find((item: any) => item.name === 'Unarmed Combat');
            assert.strictEqual(foundry.utils.getProperty(assensing, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(unarmedCombat, 'system.skill.rating'), 0);
        });

        it('skips unknown spirit types', () => {
            const migrator = new Version0_36_0();
            const actor = createSpirit('custom_unknown_type', 4);
            actor.system.half_value_skill = true;
            actor.system.attributes.body.applies_special = false;
            actor.system.attributes.body.base = 7;
            actor.items.push(createSkillItem('Assensing', 3));

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.half_value_skill, true);
            assert.strictEqual(actor.system.attributes.body.applies_special, false);
            assert.strictEqual(actor.system.attributes.body.base, 7);
            assert.strictEqual(actor.system.initiative.meatspace.attribute_a, 'reaction');
            assert.strictEqual(actor.system.initiative.meatspace.attribute_b, 'intuition');
            assert.strictEqual(actor.system.initiative.meatspace.dice.base, 2);
            assert.strictEqual(actor.system.initiative.astral.attribute_a, 'force');
            assert.strictEqual(actor.system.initiative.astral.attribute_b, 'force');
            assert.strictEqual(actor.system.initiative.astral.dice.base, 3);

            const assensing = actor.items.find((item: any) => item.name === 'Assensing');
            assert.strictEqual(foundry.utils.getProperty(assensing, 'system.skill.rating'), 3);
        });

    });

    describe('Version0_35_0 initiative modifier migration', () => {
        it('moves legacy initiative modifiers into initiative formula and removes modifier fields', () => {
            const migrator = new Version0_36_0();
            const actor = {
                _id: foundry.utils.randomID(16),
                _stats: { systemVersion: '0.33.9' },
                name: 'Legacy Character',
                type: 'character',
                items: [],
                effects: [],
                system: DataDefaults.baseSystemData('character'),
            } as any;

            actor.system.modifiers.meat_initiative = 2;
            actor.system.modifiers.meat_initiative_dice = 1;
            actor.system.modifiers.astral_initiative = -1;
            actor.system.modifiers.astral_initiative_dice = 2;
            actor.system.modifiers.matrix_initiative = 3;
            actor.system.modifiers.matrix_initiative_dice = 1;

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.initiative.meatspace.constant.base, 2);
            assert.strictEqual(actor.system.initiative.meatspace.dice.base, 2);
            assert.strictEqual(actor.system.initiative.astral.constant.base, -1);
            assert.strictEqual(actor.system.initiative.astral.dice.base, 4);
            assert.strictEqual(actor.system.initiative.matrix.constant.base, 3);
            assert.strictEqual(actor.system.initiative.matrix.dice.base, 4);

            assert.isUndefined(actor.system.modifiers.meat_initiative);
            assert.isUndefined(actor.system.modifiers.meat_initiative_dice);
            assert.isUndefined(actor.system.modifiers.astral_initiative);
            assert.isUndefined(actor.system.modifiers.astral_initiative_dice);
            assert.isUndefined(actor.system.modifiers.matrix_initiative);
            assert.isUndefined(actor.system.modifiers.matrix_initiative_dice);
        });
    });

    describe('Version0_35_0 sprite legacy migration', () => {
        const createSkillItem = (name: string, rating = 0, category: 'active' | 'knowledge' | 'language' = 'active'): any => ({
            _id: foundry.utils.randomID(16),
            name,
            type: 'skill',
            system: DataDefaults.baseSystemData('skill', {
                type: 'skill',
                skill: {
                    category,
                    attribute: 'logic',
                    rating,
                },
            }),
        });

        const createSprite = (spriteType: string, level = 6): any => ({
            _id: foundry.utils.randomID(16),
            _stats: { systemVersion: '0.34.0' },
            name: 'Legacy Sprite',
            type: 'sprite',
            items: [] as any[],
            effects: [],
            system: DataDefaults.baseSystemData('sprite', {
                spriteType,
                attributes: {
                    level: { base: level },
                    resonance: { base: 0 },
                },
                matrix: {
                    attack: { base: 0 },
                    sleaze: { base: 0 },
                    data_processing: { base: 0 },
                    firewall: { base: 0 },
                },
            }),
        });

        it('migrates known legacy sprite type into offsets, level toggles, initiative formula constant, and skill toggles', () => {
            const migrator = new Version0_36_0();
            const actor = createSprite('courier', 6);
            actor.system.level = 6;
            actor.items.push(
                createSkillItem('Computer', 0),
                createSkillItem('Hacking', 3),
                createSkillItem('Hardware', 2),
                createSkillItem('Hacking', 4),
            );

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.attributes.resonance.applies_special, true);
            assert.strictEqual(actor.system.matrix.attack.applies_special, true);
            assert.strictEqual(actor.system.matrix.sleaze.applies_special, true);
            assert.strictEqual(actor.system.matrix.data_processing.applies_special, true);
            assert.strictEqual(actor.system.matrix.firewall.applies_special, true);

            assert.strictEqual(actor.system.attributes.resonance.base, 0);
            assert.strictEqual(actor.system.matrix.attack.base, 0);
            assert.strictEqual(actor.system.matrix.sleaze.base, 3);
            assert.strictEqual(actor.system.matrix.data_processing.base, 1);
            assert.strictEqual(actor.system.matrix.firewall.base, 2);

            assert.strictEqual(actor.system.initiative.matrix.constant.base, 1);
            assert.strictEqual(actor.system.attributes.level.base, 6);
            assert.isUndefined(actor.system.level);

            const computer = actor.items.find((item: any) => item.name === 'Computer');
            const hacking = actor.items.find((item: any) => item.name === 'Hacking');
            const hardware = actor.items.find((item: any) => item.name === 'Hardware');
            assert.strictEqual(foundry.utils.getProperty(computer, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(hacking, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(hardware, 'system.skill.rating'), 0);

            const oldSleazeTotal = 6 + 3;
            const newSleazeTotal = actor.system.attributes.level.base + actor.system.matrix.sleaze.base;
            assert.strictEqual(newSleazeTotal, oldSleazeTotal);

            const oldInitBase = 6 * 2 + 1;
            const newInitBase = actor.system.attributes.level.base * 2 + actor.system.initiative.matrix.constant.base;
            assert.strictEqual(newInitBase, oldInitBase);
        });

        it('migrates another known profile with negative offsets and multiple enabled skills', () => {
            const migrator = new Version0_36_0();
            const actor = createSprite('data', 5);
            actor.system.level = 5;
            actor.items.push(
                createSkillItem('Computer', 0),
                createSkillItem('Electronic Warfare', 0),
                createSkillItem('Cybercombat', 4),
            );

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.matrix.attack.base, -1);
            assert.strictEqual(actor.system.matrix.data_processing.base, 4);
            assert.strictEqual(actor.system.matrix.firewall.base, 1);
            assert.strictEqual(actor.system.initiative.matrix.constant.base, 4);

            const computer = actor.items.find((item: any) => item.name === 'Computer');
            const electronicWarfare = actor.items.find((item: any) => item.name === 'Electronic Warfare');
            const cybercombat = actor.items.find((item: any) => item.name === 'Cybercombat');
            assert.strictEqual(foundry.utils.getProperty(computer, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(electronicWarfare, 'system.skill.rating'), 1);
            assert.strictEqual(foundry.utils.getProperty(cybercombat, 'system.skill.rating'), 0);
        });

        it('skips unknown sprite types', () => {
            const migrator = new Version0_36_0();
            const actor = createSprite('custom_unknown_type', 4);
            actor.system.level = 4;
            actor.system.matrix.attack.applies_special = false;
            actor.system.matrix.attack.base = 7;
            actor.system.modifiers.matrix_initiative = 2;
            actor.items.push(createSkillItem('Computer', 3));

            migrator.migrateActor(actor);

            assert.strictEqual(actor.system.matrix.attack.applies_special, false);
            assert.strictEqual(actor.system.matrix.attack.base, 7);
            assert.strictEqual(actor.system.initiative.matrix.constant.base, 2);

            const computer = actor.items.find((item: any) => item.name === 'Computer');
            assert.strictEqual(foundry.utils.getProperty(computer, 'system.skill.rating'), 3);
        });

        it('migrates legacy sprite level field and active effect change keys', () => {
            const migrator = new Version0_36_0();
            const actor = createSprite('unknown', 7);
            actor.system.level = 7;

            migrator.migrateActor(actor);
            assert.strictEqual(actor.system.attributes.level.base, 7);
            assert.isUndefined(actor.system.level);

            const effect = {
                system: {
                    changes: [
                        { key: 'system.modifiers.matrix_initiative', value: 1, mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                        { key: 'system.modifiers.matrix_initiative_dice', value: 1, mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                        { key: 'system.attributes.reaction', value: 1, mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                    ],
                },
            };
            migrator.migrateActiveEffect(effect);

            assert.strictEqual(effect.system.changes[0].key, 'system.initiative.matrix.constant.base');
            assert.strictEqual(effect.system.changes[1].key, 'system.initiative.matrix.dice.base');
            assert.strictEqual(effect.system.changes[2].key, 'system.attributes.reaction');
        });

        it('migrates nested item active effect keys without changing item-scoped level formulas', () => {
            const migrator = new Version0_36_0();
            const actor = createSprite('unknown', 6);
            actor.system.level = 6;

            actor.items.push({
                _id: foundry.utils.randomID(16),
                name: 'Parent Weapon',
                type: 'weapon',
                effects: [],
                flags: {
                    shadowrun5e: {
                        embeddedItems: [{
                            _id: foundry.utils.randomID(16),
                            name: 'Nested Mod',
                            type: 'modification',
                            effects: [],
                            flags: {
                                shadowrun5e: {
                                    embeddedItems: [{
                                        _id: foundry.utils.randomID(16),
                                        name: 'Deep Nested Mod',
                                        type: 'modification',
                                        effects: [{
                                            system: {
                                                changes: [
                                                    { key: 'system.level', value: '@system.level + 1', mode: CONST.ACTIVE_EFFECT_MODES.ADD },
                                                ],
                                            },
                                        }],
                                        system: DataDefaults.baseSystemData('modification'),
                                    }],
                                },
                            },
                            system: DataDefaults.baseSystemData('modification'),
                        }],
                    },
                },
                system: DataDefaults.baseSystemData('weapon'),
            } as any);

            migrator.migrateActor(actor);

            const nestedItems = foundry.utils.getProperty(actor.items[0], 'flags.shadowrun5e.embeddedItems') as any[];
            const deepNestedItems = foundry.utils.getProperty(nestedItems[0], 'flags.shadowrun5e.embeddedItems') as any[];
            const deepEffect = deepNestedItems[0].effects[0];

            assert.strictEqual(deepEffect.system.changes[0].key, 'system.attributes.level');
            assert.strictEqual(deepEffect.system.changes[0].value, '@system.level + 1');
        });

    });

    describe('Version0_36_0 active effect selection migration', () => {
        it('migrates legacy object selections to string id arrays', () => {
            const migrator = new Version0_36_0();
            const effect: any = {
                system: {
                    selection_attributes: [{ id: 'body', value: 'Body' }],
                    selection_categories: [{ id: 'social', value: 'Social' }],
                    selection_limits: [{ id: 'physical', value: 'Physical' }],
                    selection_skills: [{ id: 'automatics', value: 'Automatics' }],
                    selection_tests: [{ id: 'SuccessTest', value: 'Success Test' }],
                },
            };

            assert.isTrue(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.selection_attributes, ['body']);
            assert.deepEqual(effect.system.selection_categories, ['social']);
            assert.deepEqual(effect.system.selection_limits, ['physical']);
            assert.deepEqual(effect.system.selection_skills, ['automatics']);
            assert.deepEqual(effect.system.selection_tests, ['SuccessTest']);
        });

        it('keeps string selections unchanged and drops invalid entries', () => {
            const migrator = new Version0_36_0();
            const effect: any = {
                system: {
                    selection_attributes: ['body', null, { nope: true }],
                    selection_skills: ['automatics'],
                },
            };

            assert.isTrue(migrator.handlesActiveEffect(effect));

            migrator.migrateActiveEffect(effect);

            assert.deepEqual(effect.system.selection_attributes, ['body']);
            assert.deepEqual(effect.system.selection_skills, ['automatics']);
        });
    });
};
