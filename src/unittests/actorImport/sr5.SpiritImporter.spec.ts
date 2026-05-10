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
                    force_applies: {
                        body: true,
                        agility: true,
                        reaction: true,
                        strength: true,
                        willpower: true,
                        logic: true,
                        intuition: true,
                        charisma: true,
                        magic: true,
                        essence: true,
                    },
                    attributes: {
                        body: { base: 1 },
                        agility: { base: 2 },
                        reaction: { base: 3 },
                        strength: { base: -2 },
                        willpower: { base: 0 },
                        logic: { base: 0 },
                        intuition: { base: 1 },
                        charisma: { base: 0 },
                        magic: { base: 0 },
                        essence: { base: -2 },
                    }
                }
            });

            spirit = await SpiritImporter.import(character, template, importOptions);
            assert.notEqual(spirit, null, 'Spirit not created');
            factory.actors.push(spirit as Actor.Stored<'spirit'>);
            assert.strictEqual(spirit!.system.spiritType, 'fire_template');
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
