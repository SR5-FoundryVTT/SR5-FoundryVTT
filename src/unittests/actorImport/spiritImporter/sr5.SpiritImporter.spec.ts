import { emptySpirit } from './spirits';
import { SR5TestFactory } from 'src/unittests/util';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { SpiritImporter } from '../../../module/apps/importer/actorImport/spiritImporter/SpiritImporter';


export const spiritImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, beforeEach, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });
    
    beforeEach(async () => {
        chummerFile = structuredClone(emptySpirit);
    });

    const importOptions = {};
    let chummerFile;

    describe('Chummer Spirit Importer', () => {
        it('Does nothing when no character found', async () => {
            const item = await factory.createItem({ type: 'weapon' });
            const character = await factory.createActor({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all items no actions present', async () => {
            const item = await factory.createItem({ type: 'weapon' });
            const character = await factory.createActor({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.isEmpty(character.items);
        });

        it('Clears all items but actions', async () => {
            const item = await factory.createItem({ type: 'action' });
            const character = await factory.createActor({ type: 'spirit' });
            await character.createEmbeddedDocuments('Item', [item]);
            await new SpiritImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });
    });
};
