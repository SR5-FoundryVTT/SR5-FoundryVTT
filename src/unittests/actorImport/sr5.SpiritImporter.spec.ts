import { SR5Actor } from '@/module/actor/SR5Actor';
import { PackItemFlow } from '@/module/item/flows/PackItemFlow';
import { SR5Item } from '@/module/item/SR5Item';
import { FireSpirit } from './Examples/FireSpirit';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../module/apps/actorImport/spiritImporter/SpiritImporter';
import { CharacterImporter, ImportOptionsType } from '@/module/apps/actorImport/characterImporter/CharacterImporter';

export const spiritImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    let spirit: SR5Actor<'spirit'> | null;
    const character = FireSpirit.characters.character;

    after(async () => { await factory.destroy(); });

    const importOptions = {
        armor: true,
        contacts: true,
        cyberware: true,
        equipment: true,
        lifestyles: true,
        metamagics: true,
        powers: true,
        qualities: true,
        rituals: true,
        spells: true,
        vehicles: true,
        weapons: true,
    } satisfies ImportOptionsType;

    describe('Chummer Spirit Importer', () => {
        it('Should import a chummer character', async () => {
            const template = await factory.createActor({
                type: 'spirit',
                system: {
                    spiritType: 'fire_template',
                    attributes: {
                        body: { base: 1, applies_special: true },
                        agility: { base: 2, applies_special: true },
                        reaction: { base: 3, applies_special: true },
                        strength: { base: -2, applies_special: true },
                        willpower: { base: 0, applies_special: true },
                        logic: { base: 0, applies_special: true },
                        intuition: { base: 1, applies_special: true },
                        charisma: { base: 0, applies_special: true },
                        magic: { base: 0, applies_special: true },
                        essence: { base: -2, applies_special: true },
                    }
                }
            });

            spirit = await SpiritImporter.import(character, template, {
                ...importOptions,
                folderId: await factory.getOrCreateFolderId('Actor'),
            });
            assert.notEqual(spirit, null, 'Spirit not created');
            factory.actors.push(spirit as Actor.Stored<'spirit'>);
            assert.strictEqual(spirit!.system.spiritType, 'fire_template');
        });

        it('imports a spirit using preset profile fallback without template', async () => {
            const fallbackSpirit = await SpiritImporter.importFromPresetProfile(character, {
                ...importOptions,
                folderId: await factory.getOrCreateFolderId('Actor'),
            });
            assert.notEqual(fallbackSpirit, null, 'Spirit fallback import failed');
            factory.actors.push(fallbackSpirit as Actor.Stored<'spirit'>);

            assert.strictEqual(fallbackSpirit!.system.spiritType, 'fire');
            assert.strictEqual(fallbackSpirit!.system.half_value_skill, false);
            assert.strictEqual(fallbackSpirit!.system.attributes.body.applies_special, true);
            assert.strictEqual(fallbackSpirit!.system.attributes.magic.applies_special, true);
            assert.strictEqual(fallbackSpirit!.system.attributes.body.base, 1);
            assert.strictEqual(fallbackSpirit!.system.attributes.agility.base, 2);
            assert.strictEqual(fallbackSpirit!.system.attributes.reaction.base, 3);
            assert.strictEqual(fallbackSpirit!.system.attributes.strength.base, -2);
            assert.strictEqual(fallbackSpirit!.system.attributes.intuition.base, 1);
            assert.strictEqual(fallbackSpirit!.system.initiative.meatspace.attribute_a, 'force');
            assert.strictEqual(fallbackSpirit!.system.initiative.meatspace.attribute_b, 'force');
            assert.strictEqual(fallbackSpirit!.system.initiative.meatspace.constant.base, 3);
            assert.strictEqual(fallbackSpirit!.system.initiative.meatspace.dice.value, 2);
            assert.strictEqual(fallbackSpirit!.system.initiative.astral.attribute_a, 'force');
            assert.strictEqual(fallbackSpirit!.system.initiative.astral.attribute_b, 'force');
            assert.strictEqual(fallbackSpirit!.system.initiative.astral.constant.base, 0);
            assert.strictEqual(fallbackSpirit!.system.initiative.astral.dice.value, 3);
            assert.strictEqual(fallbackSpirit!.system.attributes.force.base, 3);
            assert.strictEqual(fallbackSpirit!.system.attributes.edge.base, 2);
            assert.strictEqual(fallbackSpirit!.system.attributes.essence.value, 3);
        });

        it('Should have the correct attributes and limits', async () => {
            if (!spirit) throw new Error('No spirit created');

            assert.strictEqual(spirit.name, character.name, 'Name');
            assert.strictEqual(spirit.system.limits.physical.value, Number(character.limitphysical), 'Physical Limit');
            assert.strictEqual(spirit.system.limits.mental.value, Number(character.limitmental), 'Mental Limit');
            assert.strictEqual(spirit.system.limits.social.value, Number(character.limitsocial), 'Social Limit');
            assert.strictEqual(spirit.system.limits.astral.value, Number(character.limitastral), 'Astral Limit');

            for (const attr of Object.values(character.attributes[1].attribute)) {
                const parsedName = CharacterImporter.parseAttName(attr.name_english);
                if (!parsedName) continue;

                console.log(parsedName, spirit.system.attributes[parsedName], attr.total);
                assert.strictEqual(spirit.system.attributes[parsedName].value, Number(attr.total), `Attribute ${parsedName}`);
            }
        });
        
        it('Should have the correct item number', async () => {
            if (!spirit) throw new Error('No spirit created');
            const skillSet = await fromUuid(spirit.system.skillset) as SR5Item<'skill'> | null;
            if (!skillSet) throw new Error('No skillset assigned');

            const skillItems = await PackItemFlow.prepareSkillsForSkillSet(skillSet);
            const skillGroups = await PackItemFlow.prepareSkillGroupsForSkillSet(skillSet);
            const nonSkillItems = spirit.items.filter(item => !item.isType('skill')).length;

            assert.lengthOf(spirit.items, nonSkillItems + skillItems.length + skillGroups.length, 'Item count');
        });
    });
};
