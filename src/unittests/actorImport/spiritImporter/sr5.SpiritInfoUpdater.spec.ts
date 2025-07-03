import { emptySpirit } from './spirits';
import { SR5TestFactory } from 'src/unittests/utils.js';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../../module/apps/importer/actorImport/spiritImporter/SpiritImporter.js';

export const spiritInfoUpdaterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, beforeEach, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });
    
    beforeEach(async () => {
        chummerFile = structuredClone(emptySpirit);
    });

    const importOptions = {};
    let chummerFile;

    describe('Chummer Info Updater handles alias correctly', () => {
        it('Imports name', async () => {
            chummerFile.characters.character.alias = 'ImportTester';

            const spirit = await factory.createActor({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.name, 'ImportTester');
            assert.strictEqual(spirit.prototypeToken.name, 'ImportTester');
        });

        it('Sets placeholder when no alias', async () => {
            const spirit = await factory.createActor({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.name, '[Name not found]');
            assert.strictEqual(spirit.prototypeToken.name, '[Name not found]');
        });
    });

    describe('Chummer Info Updater handles attributes correctly', () => {
        it('Imports force attribute', async () => {
            chummerFile.characters.character = {
                attributes: [
                    '0',
                    {
                        attributecategory_english: 'Standard',
                        attribute: [
                            {
                                name_english: 'MAG',
                                total: '3'
                            },
                        ],
                    },
                ],
            };
            const spirit = await factory.createActor({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.force, 3);
        });
    });

    describe('Chummer Info Updater handles spirit type correctly', () => {
        it('maps existing spirit type', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Fire';
            const spirit = await factory.createActor({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.spiritType, 'fire');
        });

        it('writes nothing when spirit type not found', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Bullshit';
            const spirit = await factory.createActor({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.spiritType, '');
        });
    });
};
