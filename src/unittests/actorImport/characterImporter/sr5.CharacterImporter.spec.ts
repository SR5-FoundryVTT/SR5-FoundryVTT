import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { CharacterImporter } from '../../../module/apps/importer/actorImport/characterImporter/CharacterImporter';
import { SR5TestingDocuments } from '../../utils';
import { SR5Actor } from '../../../module/actor/SR5Actor';
import { SR5Item } from '../../../module/item/SR5Item';

export const characterImporterTesting = (context: QuenchBatchContext) => {
    const { describe, it, assert, before, after } = context;

    let testActor;
    let importOptions = {};
    let chummerFile = {
        characters: {
            character: {},
        },
    };

    before(async () => {
        testActor = new SR5TestingDocuments(SR5Actor);
    });
    after(async () => {
        await testActor.teardown();
    });

    describe('Chummer Character Importer', () => {
        let testItem = new SR5TestingDocuments(SR5Item);

        it('Does nothing when no character found', async () => {
            const item = await testItem.create({ type: 'weapon' }) as SR5Item;
            const character = await testActor.create({ 'type': 'character', 'system.metatype': 'human' });
            await character.createEmbeddedDocuments('Item', [item]);
            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, {}, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all imported items', async () => {
            const item = await testItem.create({ type: 'weapon' }) as SR5Item;
            await item.update({'system.importFlags.isImported': true})

            const character = await testActor.create({ 'type': 'character', 'system.metatype': 'human' });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.isEmpty(character.items);
        });

        it('Clears all items but not imported ones', async () => {
            const item = await testItem.create({ type: 'weapon' }) as SR5Item;

            const character = await testActor.create({ 'type': 'character', 'system.metatype': 'human' });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
        });

        it('Clears all items but actions', async () => {
            const item = await testItem.create({ type: 'action' }) as SR5Item;
            const character = await testActor.create({ 'type': 'character', 'system.metatype': 'human' });
            await character.createEmbeddedDocuments('Item', [item]);
            
            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all items but effects', async () => {
            let item = await testItem.create({ type: 'weapon' }) as Item;
            item.createEmbeddedDocuments('ActiveEffect', [{
                origin: item.uuid,
                disabled: false,
                label: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body.mod', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'system.attributes.body', value: 2, mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }]
            }]);
            const character = await testActor.create({ 'type': 'character', 'system.metatype': 'human' });
            await character.createEmbeddedDocuments('Item', [item]);
            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });
    });

};