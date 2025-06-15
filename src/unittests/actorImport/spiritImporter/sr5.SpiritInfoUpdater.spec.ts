import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../../module/apps/importer/actorImport/spiritImporter/SpiritImporter.js';
import { SR5Actor } from '../../../module/actor/SR5Actor';
import { emptySpirit } from './spirits';

export const spiritInfoUpdaterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, beforeEach, after } = context;

    const importOptions = {};
    let chummerFile;

    before(async () => {});

    beforeEach(async () => {
        chummerFile = structuredClone(emptySpirit);
    });

    after(async () => {});

    describe('Chummer Info Updater handles alias correctly', () => {
        it('Imports name', async () => {
            chummerFile.characters.character.alias = 'ImportTester';

            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.strictEqual(character.name, 'ImportTester');
            assert.strictEqual(character.prototypeToken.name, 'ImportTester');

            await character.delete();
        });

        it('Sets placeholder when no alias', async () => {
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.strictEqual(character.name, '[Name not found]');
            assert.strictEqual(character.prototypeToken.name, '[Name not found]');

            await character.delete();
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
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.strictEqual(character.system.force, 3);

            await character.delete();
        });
    });

    describe('Chummer Info Updater handles spirit type correctly', () => {
        it('maps existing spirit type', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Fire';
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.strictEqual(character.system.spiritType, 'fire');
        });

        it('writes nothing when spirit type not found', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Bullshit';
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.strictEqual(character.system.spiritType, '');
        });
    });
};
