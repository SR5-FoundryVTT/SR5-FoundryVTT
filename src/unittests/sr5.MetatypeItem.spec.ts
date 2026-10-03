import { SR5TestFactory } from './utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { MetatypeFlow } from '@/module/flows/MetatypeFlow';
import { MetatypeSelector } from '@/module/apps/actor/MetatypeSelector';
import { SR5Item } from '@/module/item/SR5Item';

const sampleHumanData: Item.CreateData<'metatype'> = {
    name: 'Human',
    type: 'metatype',
    system: {
        metatype: 'human',
        subtype: 'metahuman',
        karma: 0,
        attributes: {
            body: { min: 1, max: 6, aug_max: 9 },
            edge: { min: 2, max: 7, aug_max: 10 },
        },
        qualities: [],
        weapons: [],
        items: [],
    },
};

const sampleElfData: Item.CreateData<'metatype'> = {
    name: 'Elf',
    type: 'metatype',
    system: {
        metatype: 'elf',
        subtype: 'metahuman',
        karma: 40,
        attributes: {
            agility: { min: 2, max: 7, aug_max: 10 },
            charisma: { min: 3, max: 8, aug_max: 12 },
        },
        qualities: [
            'Compendium.shadowrun5e.sr5e-qualities.Item.quality00lowlight',
        ],
        weapons: [],
        items: [],
    },
};

export const shadowrunMetatypeItemTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => {
        await factory.destroy();
    });

    describe('Metatype Item and Metavariants', () => {
        it('Metatype DataModel initializes correctly with attributes, trait UUIDs, and getters', async () => {
            const metatypeItem = await factory.createItem(sampleElfData) as SR5Item<'metatype'>;

            assert.strictEqual(metatypeItem.type, 'metatype');
            assert.strictEqual(metatypeItem.system.metatype, 'elf');
            assert.strictEqual(metatypeItem.system.karma, 40);

            // Trait UUIDs are stored as arrays of DocumentUUID strings
            assert.deepEqual(metatypeItem.system.qualities, [
                'Compendium.shadowrun5e.sr5e-qualities.Item.quality00lowlight',
            ]);
            assert.deepEqual(metatypeItem.system.weapons, []);
            assert.deepEqual(metatypeItem.system.items, []);

            const ranges = metatypeItem.system.getActiveAttributeRanges();
            assert.isDefined(ranges.agility);
            assert.strictEqual(ranges.agility.min, 2);
            assert.strictEqual(ranges.agility.max, 7);
            assert.strictEqual(ranges.agility.aug_max, 10);
            assert.strictEqual(ranges.charisma.min, 3);
            assert.strictEqual(ranges.charisma.max, 8);
        });

        it('Applying a metatype item to a character updates metatype and attribute ranges', async () => {
            const character = await factory.createActor({ type: 'character' });
            await MetatypeFlow.applyMetatypeToActor(character, sampleHumanData);

            const metatypeItem = character.items.find(i => i.isType('metatype'));
            assert.isDefined(metatypeItem, 'Character should have applied metatype item');
            assert.strictEqual(metatypeItem?.system.metatype, 'human');
            assert.strictEqual(character.system.metatype, 'Human');

            // Attributes min should be enforced from metatype ranges (e.g. body >= 1)
            assert.isAtLeast(character.system.attributes.body.value, 1);
            assert.isAtLeast(character.system.attributes.edge.value, 2);
        });

        it('Applying a new metatype item replaces existing metatype and updates metatype', async () => {
            const character = await factory.createActor({ type: 'character' });
            await MetatypeFlow.applyMetatypeToActor(character, sampleHumanData);
            assert.strictEqual(character.items.filter(i => i.isType('metatype')).length, 1);

            // Apply Elf metatype
            await MetatypeFlow.applyMetatypeToActor(character, sampleElfData);

            const updatedMetatypes = character.items.filter(i => i.isType('metatype'));
            assert.strictEqual(updatedMetatypes.length, 1, 'Actor should still only have 1 metatype item');
            assert.strictEqual(character.system.metatype, 'Elf');

            // Elf agility range: max 7, aug_max 10
            const activeMetatype = updatedMetatypes[0];
            const ranges = activeMetatype.system.getActiveAttributeRanges();
            assert.strictEqual(ranges.agility.max, 7);
            assert.strictEqual(ranges.agility.aug_max, 10);
        });

        it('Switching from Troll to Elf removes previous metatype values and applies Elf attribute changes, preserving invested points', async () => {
            const character = await factory.createActor({ type: 'character' });

            const trollData: Item.CreateData<'metatype'> = {
                name: 'Troll',
                type: 'metatype',
                system: {
                    metatype: 'troll',
                    subtype: 'metahuman',
                    karma: 90,
                    attributes: {
                        body: { min: 5, max: 10, aug_max: 15 },
                        strength: { min: 5, max: 10, aug_max: 15 },
                        agility: { min: 1, max: 5, aug_max: 8 },
                        charisma: { min: 1, max: 4, aug_max: 6 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                },
            };

            const elfData: Item.CreateData<'metatype'> = {
                name: 'Elf',
                type: 'metatype',
                system: {
                    metatype: 'elf',
                    subtype: 'metahuman',
                    karma: 40,
                    attributes: {
                        body: { min: 1, max: 6, aug_max: 9 },
                        strength: { min: 1, max: 6, aug_max: 9 },
                        agility: { min: 2, max: 7, aug_max: 10 },
                        charisma: { min: 3, max: 8, aug_max: 12 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                },
            };

            // 1. Apply Troll
            await MetatypeFlow.applyMetatypeToActor(character, trollData);
            assert.strictEqual(character.system.attributes.body.base, 5);
            assert.strictEqual(character.system.attributes.strength.base, 5);
            assert.strictEqual(character.system.attributes.agility.base, 1);
            assert.strictEqual(character.system.attributes.charisma.base, 1);

            // 2. Player invests 2 points into Body (raises from 5 to 7)
            await character.update({ system: { attributes: { body: { base: 7 } } } });
            assert.strictEqual(character.system.attributes.body.base, 7);

            // 3. Switch to Elf: removes Troll's benefits and adds Elf's benefits
            await MetatypeFlow.applyMetatypeToActor(character, elfData);
            assert.strictEqual(character.system.metatype, 'Elf');
            // Body: was 7, minus Troll 5 = 2 invested, plus Elf 1 = 3
            assert.strictEqual(character.system.attributes.body.base, 3, 'Body preserves 2 invested points on top of Elf min 1');
            assert.strictEqual(character.system.attributes.strength.base, 1, 'Strength resets from Troll 5 to Elf min 1');
            assert.strictEqual(character.system.attributes.agility.base, 2, 'Agility updates to Elf min 2');
            assert.strictEqual(character.system.attributes.charisma.base, 3, 'Charisma updates to Elf min 3');

            // 4. Deleting Elf removes Elf's benefits while still preserving the 2 invested points
            const elfItem = character.items.find(i => i.isType('metatype'));
            assert.isDefined(elfItem);
            await elfItem!.delete();
            assert.strictEqual(character.system.attributes.body.base, 2, 'Body preserves 2 invested points after metatype deletion');
            assert.strictEqual(character.system.attributes.strength.base, 0);
            assert.strictEqual(character.system.attributes.agility.base, 0);
            assert.strictEqual(character.system.attributes.charisma.base, 0);
        });

        it('Granted traits (qualities, weapons, items) are stored as UUIDs, granted on actor, and cleaned up on deletion', async () => {
            // Create trait items that represent metatype enhancements
            const lowLightQuality = await factory.createItem({
                name: 'Low-Light Vision',
                type: 'quality',
                system: {
                    type: 'positive',
                    karma: 0,
                    rating: 0,
                },
            });

            const dermalArmorWeapon = await factory.createItem({
                name: 'Troll Horns',
                type: 'weapon',
                system: {
                    category: 'melee',
                },
            });

            // Define metatype item storing trait UUIDs in qualities, weapons, and items
            const trollMetatypeData: Item.CreateData<'metatype'> = {
                name: 'Troll',
                type: 'metatype',
                system: {
                    metatype: 'troll',
                    subtype: 'metahuman',
                    karma: 90,
                    attributes: {
                        body: { min: 5, max: 10, aug_max: 15 },
                        strength: { min: 5, max: 10, aug_max: 15 },
                    },
                    qualities: [lowLightQuality.uuid],
                    weapons: [dermalArmorWeapon.uuid],
                    items: [],
                },
            };

            const metatypeItem = await factory.createItem(trollMetatypeData) as SR5Item<'metatype'>;
            assert.deepEqual(metatypeItem.system.qualities, [lowLightQuality.uuid]);
            assert.deepEqual(metatypeItem.system.weapons, [dermalArmorWeapon.uuid]);

            // Apply to character
            const character = await factory.createActor({ type: 'character' });
            await MetatypeFlow.applyMetatypeToActor(character, metatypeItem);

            // Verify base attributes meet racial minimums
            assert.isAtLeast(character.system.attributes.body.value, 5, 'Body should meet Troll racial minimum of 5');
            assert.isAtLeast(character.system.attributes.strength.value, 5, 'Strength should meet Troll racial minimum of 5');

            // Verify granted items are copied to the actor
            const grantedQuality = character.items.find(i => i.isType('quality') && i.name === 'Low-Light Vision');
            const grantedWeapon = character.items.find(i => i.isType('weapon') && i.name === 'Troll Horns');
            assert.isDefined(grantedQuality, 'Quality trait should be granted to actor');
            assert.isDefined(grantedWeapon, 'Weapon trait should be granted to actor');

            // Verify actor's embedded metatype item has its links rewritten to actor's local item UUIDs
            const actorMetatype = character.items.find(i => i.isType('metatype'));
            assert.isDefined(actorMetatype);
            assert.deepEqual(actorMetatype!.system.qualities, [grantedQuality!.uuid]);
            assert.deepEqual(actorMetatype!.system.weapons, [grantedWeapon!.uuid]);

            // Delete the metatype item and verify granted traits are cleaned up
            await actorMetatype!.delete();
            assert.isUndefined(character.items.find(i => i.id === grantedQuality!.id));
            assert.isUndefined(character.items.find(i => i.id === grantedWeapon!.id));
        });

        it('Deleting character metatype item clears metatype link', async () => {
            const character = await factory.createActor({ type: 'character' });
            await MetatypeFlow.applyMetatypeToActor(character, sampleHumanData);
            const metatypeItem = character.items.find(i => i.isType('metatype'));
            assert.isDefined(metatypeItem);

            // Delete the metatype item
            await metatypeItem!.delete();

            const remainingMetatypes = character.items.filter(i => i.isType('metatype'));
            assert.strictEqual(remainingMetatypes.length, 0, 'Metatype item should be deleted');
            assert.strictEqual(character.system.metatypeUuid, null);
            assert.strictEqual(character.system.attributes.body.base, 0);
        });

        it('Base metatype items have empty descriptions and proper metaTypesItems flags', async () => {
            const trollData: Item.CreateData<'metatype'> = {
                name: 'Troll',
                type: 'metatype',
                system: {
                    description: { value: '', chat: '', source: 'SR5' },
                    metatype: 'troll',
                    subtype: 'metahuman',
                    karma: 90,
                    attributes: { body: { min: 5, max: 10, aug_max: 15 } },
                    qualities: [
                        'Compendium.world.sr5trait.Item.vtuieKxvSSfRyB2N',
                        'Compendium.world.sr5trait.Item.fydCbpyhuL0u6dfL'
                    ],
                    weapons: [],
                    items: [],
                },
                flags: {
                    shadowrun5e: {
                        metaTypesItems: [
                            {
                                id: 'vtuieKxvSSfRyB2N',
                                foundryUuid: 'Compendium.world.sr5trait.Item.vtuieKxvSSfRyB2N',
                                chummerId: '02e76a38-304e-4a0e-93a3-ad2938306afc',
                                name: 'Thermographic Vision',
                                type: 'quality',
                                category: 'quality'
                            },
                            {
                                id: 'fydCbpyhuL0u6dfL',
                                foundryUuid: 'Compendium.world.sr5trait.Item.fydCbpyhuL0u6dfL',
                                chummerId: '72d1d797-4b61-4fbd-97b7-ffb8ea9ddf36',
                                name: 'Dermal Deposits',
                                type: 'quality',
                                category: 'quality'
                            }
                        ]
                    }
                }
            };

            const trollItem = await factory.createItem(trollData) as SR5Item<'metatype'>;
            assert.strictEqual(trollItem.system.description.value, '', 'Metatype description should remain empty');
            assert.lengthOf(trollItem.system.qualities, 2);
            assert.strictEqual(trollItem.system.qualities[0], 'Compendium.world.sr5trait.Item.vtuieKxvSSfRyB2N');
            assert.strictEqual(trollItem.system.qualities[1], 'Compendium.world.sr5trait.Item.fydCbpyhuL0u6dfL');

            const flags = trollItem.flags?.shadowrun5e?.metaTypesItems;
            assert.isArray(flags);
            assert.lengthOf(flags!, 2);
            assert.strictEqual(flags![0].chummerId, '02e76a38-304e-4a0e-93a3-ad2938306afc');
            assert.strictEqual(flags![1].chummerId, '72d1d797-4b61-4fbd-97b7-ffb8ea9ddf36');
        });

        it('NPC grunt metatype applies metatype modifiers to attributes', async () => {
            const grunt = await factory.createActor({
                type: 'character',
                system: {
                    is_npc: true,
                    npc: { is_grunt: true },
                    metatype: 'ork',
                }
            });
            // Ork grunt has body: +3, strength: +2
            assert.strictEqual(grunt.system.attributes.body.value, 4);
            assert.strictEqual(grunt.system.attributes.strength.value, 3);
        });

        it('MetatypeSelector prepares cards from world and compendium items', async () => {
            const actor = await factory.createActor({
                type: 'character',
                system: {
                    metatype: 'Elf',
                },
            });

            // Create world metatypes
            const worldElf = await factory.createItem(sampleElfData) as SR5Item<'metatype'>;
            const worldHuman = await factory.createItem(sampleHumanData) as SR5Item<'metatype'>;

            const selector = new MetatypeSelector(actor);
            const context = await selector._prepareContext({ isFirstRender: true });

            assert.isArray(context.items);
            assert.isTrue(context.items.length >= 2, 'Should have at least 2 metatype cards');

            const elfCard = context.items.find(m => m.uuid === worldElf.uuid || m.name === 'Elf');
            assert.isDefined(elfCard, 'Elf card should exist');
            assert.strictEqual(elfCard!.karma, 40);
            assert.strictEqual(elfCard!.sourceLabel, 'World');
            assert.isTrue(elfCard!.isSelected, 'Current actor metatype should be preselected');

            const humanCard = context.items.find(m => m.uuid === worldHuman.uuid || m.name === 'Human');
            assert.isDefined(humanCard, 'Human card should exist');
            assert.strictEqual(humanCard!.karma, 0);
            assert.strictEqual(humanCard!.sourceLabel, 'World');
            assert.isFalse(humanCard!.isSelected, 'Non-current metatype should not be preselected');

            assert.isTrue(context.hasCurrentMetatype);
        });

        it('MetatypeFlow.localizeMetatype resolves translation or returns original name', async () => {
            const worldElf = await factory.createItem(sampleElfData) as SR5Item<'metatype'>;
            const localizedDoc = MetatypeFlow.localizeMetatype(worldElf);
            assert.isString(localizedDoc);
            assert.isNotEmpty(localizedDoc);

            const localizedName = MetatypeFlow.localizeMetatype('Elf');
            assert.isString(localizedName);
            assert.isNotEmpty(localizedName);

            const unknown = MetatypeFlow.localizeMetatype('CustomNonExistentMetatype');
            assert.strictEqual(unknown, 'CustomNonExistentMetatype');
        });

        it('Applying an infected metatype unlocks Magic attribute and sets special to magic', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.strictEqual(character.system.special, 'mundane');

            const vampireData: Item.CreateData<'metatype'> = {
                name: 'Vampire (Human)',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'infected',
                    subsubtype: 'vampire',
                    karma: 27,
                    attributes: {
                        body: { min: 2, max: 7, aug_max: 10 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                },
                flags: {
                    shadowrun5e: {
                        metaTypesItems: [
                            { name: 'Dual Natured', power: 'Dual Natured', category: 'power' },
                            { name: 'Essence Drain', power: 'Essence Drain', category: 'power' },
                        ]
                    }
                }
            };

            await MetatypeFlow.applyMetatypeToActor(character, vampireData);

            assert.strictEqual(character.system.special, 'magic');
            assert.isAtLeast(character.system.attributes.magic.base, 1);
            assert.isTrue(character.isAwakened());
        });

        it('Applying a natural magician infected metatype sets magic type to magician and initial magic to min(6, Essence)', async () => {
            const character = await factory.createActor({ type: 'character' });
            assert.strictEqual(character.system.special, 'mundane');

            const nosferatuData: Item.CreateData<'metatype'> = {
                name: 'Nosferatu',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'infected',
                    subsubtype: 'nosferatu',
                    karma: 48,
                    attributes: {
                        body: { min: 2, max: 7, aug_max: 10 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                },
                flags: {
                    shadowrun5e: {
                        metaTypesItems: [
                            { name: 'Dual Natured', power: 'Dual Natured', category: 'power' },
                            { name: 'Natural Magician', power: 'Natural Magician', category: 'power' },
                        ]
                    }
                }
            };

            await MetatypeFlow.applyMetatypeToActor(character, nosferatuData);

            assert.strictEqual(character.system.special, 'magic');
            assert.strictEqual(character.system.magic.type, 'magician');
            const expectedMagic = Math.floor(Math.min(6, character.system.attributes.essence.value));
            assert.strictEqual(character.system.attributes.magic.base, expectedMagic);
        });

        it('Applying a critter metatype to a critter actor sets attributes directly from range.min', async () => {
            const critter = await factory.createActor({
                type: 'character',
                system: {
                    is_critter: true,
                    is_npc: true,
                }
            });

            const critterMetatypeData: Item.CreateData<'metatype'> = {
                name: 'Barghest',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'critter',
                    karma: 0,
                    attributes: {
                        body: { min: 6, max: 10, aug_max: 14 },
                        agility: { min: 4, max: 8, aug_max: 12 },
                        magic: { min: 4, max: 8, aug_max: 12 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                }
            };

            await MetatypeFlow.applyMetatypeToActor(critter, critterMetatypeData);

            assert.strictEqual(critter.system.attributes.body.base, 6);
            assert.strictEqual(critter.system.attributes.agility.base, 4);
            assert.strictEqual(critter.system.attributes.magic.base, 4);
            assert.strictEqual(critter.system.special, 'magic');
            assert.strictEqual(critter.system.metatype, 'Barghest');
        });

        it('MetatypeFlow.localizeMetatype preserves specific variant/strain names like Nosferatu instead of overriding with base metatype', async () => {
            const nosferatuItem = await factory.createItem({
                name: 'Nosferatu',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'infected',
                    subsubtype: 'nosferatu',
                    karma: 48,
                    attributes: {},
                    qualities: [],
                    weapons: [],
                    items: [],
                }
            }) as SR5Item<'metatype'>;

            const localized = MetatypeFlow.localizeMetatype(nosferatuItem);
            assert.strictEqual(localized, 'Nosferatu');
        });

        it('Actor _preCreate automatically embeds metatype item from system.metatypeUuid when missing from items', async () => {
            const metatypeItem = await factory.createItem({
                name: 'Nosferatu',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'infected',
                    subsubtype: 'nosferatu',
                    karma: 48,
                    attributes: {
                        body: { min: 4, max: 9, aug_max: 13 },
                    },
                    qualities: [],
                    weapons: [],
                    items: [],
                }
            }) as SR5Item<'metatype'>;

            const actor = await factory.createActor({
                type: 'character',
                system: {
                    metatype: 'Nosferatu',
                    metatypeUuid: metatypeItem.uuid,
                }
            });

            const embeddedMetatype = actor.items.find(i => i.isType('metatype'));
            assert.isDefined(embeddedMetatype, 'Actor should auto-embed metatype item from metatypeUuid');
            assert.strictEqual(embeddedMetatype?.name, 'Nosferatu');
            assert.strictEqual(actor.metatypeItem?.name, 'Nosferatu');
        });

        it('MetatypeFlow.localizeSubtype and localizeSubsubtype correctly translate or format values', async () => {
            const nosferatuItem = await factory.createItem({
                name: 'Nosferatu',
                type: 'metatype',
                system: {
                    metatype: 'human',
                    subtype: 'infected',
                    subsubtype: 'nosferatu',
                    karma: 48,
                    attributes: {},
                    qualities: [],
                    weapons: [],
                    items: [],
                }
            }) as SR5Item<'metatype'>;

            const subtype = MetatypeFlow.localizeSubtype(nosferatuItem);
            assert.isNotEmpty(subtype);

            const subsubtype = MetatypeFlow.localizeSubsubtype(nosferatuItem);
            assert.isNotEmpty(subsubtype);

            assert.strictEqual(MetatypeFlow.localizeSubtype('infected'), MetatypeFlow.localizeSubtype(nosferatuItem));
            assert.strictEqual(MetatypeFlow.localizeSubsubtype('nosferatu'), MetatypeFlow.localizeSubsubtype(nosferatuItem));
        });

        it('MetatypeItemParser guarantees a valid existing icon path is assigned', async () => {
            const { MetatypeItemParser } = await import('@/module/apps/itemImport/parser/metatype/MetatypeItemParser');
            const parser = new MetatypeItemParser();
            const infectedData = {
                id: { _TEXT: '11111111-2222-3333-4444-555555555555' },
                name: { _TEXT: 'Vampire' },
                category: { _TEXT: 'Infected' },
                bodmin: { _TEXT: '3' },
            };
            const parsed = await parser.Parse(infectedData as any, 'Metatype');
            assert.isDefined(parsed.img);
            assert.include(parsed.img, 'critter/infected.svg');
        });

        it('MetatypeItemParser dynamically detects powers that are natural weapons and assigns them to weapons', async () => {
            const { MetatypeItemParser } = await import('@/module/apps/itemImport/parser/metatype/MetatypeItemParser');
            const { NaturalWeaponHelper } = await import('@/module/apps/itemImport/helper/NaturalWeaponHelper');

            const testPowerEntry = {
                _TEXT: 'Natural Weapon',
                $: { select: 'Bite (Infection): DV ({STR})P, AP -1' },
            };
            assert.isTrue(NaturalWeaponHelper.isNaturalWeapon(testPowerEntry));

            const parser = new MetatypeItemParser();
            const vampireData = {
                id: { _TEXT: '11111111-2222-3333-4444-555555555555' },
                name: { _TEXT: 'Vampire' },
                category: { _TEXT: 'Infected' },
                powers: {
                    power: [testPowerEntry],
                },
            };

            const parsed = await parser.Parse(vampireData as any, 'Metatype');
            const system = parsed.system as Item.SystemOfType<'metatype'>;
            const metaFlags = (parsed.flags?.shadowrun5e as any)?.metaTypesItems as Array<{
                name: string;
                power: string;
                select?: string;
                foundryUuid?: string;
                category: string;
            }>;

            // Weapons array must contain the resolved natural weapon UUID
            assert.isTrue(system.weapons.length > 0, 'Metatype system.weapons should contain the parsed natural weapon');
            assert.isFalse(system.qualities.some(q => q.includes('Natural Weapon') || q.includes('Bite')),
                'Natural weapon should not be in system.qualities');

            // Flag should register it under category "weapon"
            const weaponFlag = metaFlags?.find(f => f.name.includes('Bite') || f.power === 'Natural Weapon');
            assert.isDefined(weaponFlag, 'metaTypesItems should contain flag entry for natural weapon');
            assert.strictEqual(weaponFlag?.category, 'weapon', 'Weapon flag should have category weapon');
        });

        it('ImportHelper.withUnlockedCompendium safely restores locked state after operation', async () => {
            const { ImportHelper } = await import('@/module/apps/itemImport/helper/ImportHelper');
            const mockPack = {
                collection: 'world.testpack',
                locked: true,
                configure: async function(options: { locked: boolean }) {
                    this.locked = options.locked;
                    return this;
                },
            };

            let executedWhileUnlocked = false;
            await ImportHelper.withUnlockedCompendium(mockPack as any, async (pack) => {
                executedWhileUnlocked = !pack.locked;
            });

            assert.isTrue(executedWhileUnlocked, 'Compendium should be unlocked during callback execution');
            assert.isTrue(mockPack.locked, 'Compendium locked state should be restored to true after execution');
        });
    });
};

export const shadowrunRaceItemTesting = shadowrunMetatypeItemTesting;

