import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../../module/apps/importer/actorImport/spiritImporter/SpiritImporter';
import { SR5Actor } from '../../../module/actor/SR5Actor';
import { SR5Item } from '../../../module/item/SR5Item';
import { emptySpirit } from './spirits';


export const spiritImporterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, beforeEach, after } = context;

    const importOptions = {};
    let chummerFile;

    before(async () => {});

    beforeEach(async () => {
        chummerFile = structuredClone(emptySpirit);
    });

    after(async () => {});

    describe('Chummer Spirit Importer', () => {
        it('Does nothing when no character found', async () => {
            const item = new SR5Item<'weapon'>({ type: 'weapon' });
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);

            await character.delete();
            await item.delete();
        });

        it('Clears all items no actions present', async () => {
            const item = new SR5Item<'weapon'>({ type: 'weapon' });
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.isEmpty(character.items);

            await character.delete();
            await item.delete();
        });

        it('Clears all items but actions', async () => {
            const item = new SR5Item<'weapon'>({ type: 'action' });
            const character = new SR5Actor<'spirit'>({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);

            await character.delete();
            await item.delete();
        });
    });
};
