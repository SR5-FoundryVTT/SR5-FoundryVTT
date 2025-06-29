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

            const spirit = await SR5Actor.create({ name: 'QUENCH', type: 'spirit' }) as SR5Actor<'spirit'>;
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.name, 'ImportTester');
            assert.strictEqual(spirit.prototypeToken.name, 'ImportTester');

            await spirit.delete();
        });

        it('Sets placeholder when no alias', async () => {
            const spirit = await SR5Actor.create({ name: 'QUENCH', type: 'spirit' }) as SR5Actor<'spirit'>;
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.name, '[Name not found]');
            assert.strictEqual(spirit.prototypeToken.name, '[Name not found]');

            await spirit.delete();
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
            const spirit = await SR5Actor.create({ name: 'QUENCH', type: 'spirit' }) as SR5Actor<'spirit'>;
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.force, 3);

            await spirit.delete();
        });
    });

    describe('Chummer Info Updater handles spirit type correctly', () => {
        it('maps existing spirit type', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Fire';
            const spirit = await SR5Actor.create({ name: 'QUENCH', type: 'spirit' }) as SR5Actor<'spirit'>;
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.spiritType, 'fire');
            await spirit.delete();
        });

        it('writes nothing when spirit type not found', async () => {
            chummerFile.characters.character.metatype_english = 'Spirit of Bullshit';
            const spirit = await SR5Actor.create({ name: 'QUENCH', type: 'spirit' }) as SR5Actor<'spirit'>
            await new SpiritImporter().importChummerCharacter(spirit, chummerFile, importOptions);

            assert.strictEqual(spirit.system.spiritType, '');
            await spirit.delete();
        });
    });
};
