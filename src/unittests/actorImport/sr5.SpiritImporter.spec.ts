import { SR5Actor } from '@/module/actor/SR5Actor';
import { FireSpirit } from './Examples/FireSpirit';
import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../module/apps/actorImport/spiritImporter/SpiritImporter';
import { CharacterImporter, importOptionsType } from '@/module/apps/actorImport/characterImporter/CharacterImporter';

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
    } satisfies importOptionsType;

    describe('Chummer Spirit Importer', () => {
        it('Should import a chummer character', async () => {
            spirit = await SpiritImporter.import(character, 'fire', importOptions);
            assert.notEqual(spirit, null, 'Spirit not created');
            factory.actors.push(spirit!);
            assert.strictEqual(spirit!.system.spiritType, 'fire');
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
            assert.lengthOf(spirit.items, 11, 'Item count');
        });
    });
};
