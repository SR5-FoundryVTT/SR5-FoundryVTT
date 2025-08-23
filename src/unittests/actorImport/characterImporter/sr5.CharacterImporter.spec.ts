import { SR5TestFactory } from 'src/unittests/utils';
import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { ActorFile, ActorSchema } from 'src/module/apps/importer/actorImport/ActorSchema';
import { CharacterImporter } from '../../../module/apps/importer/actorImport/characterImporter/CharacterImporter';

export const characterImporterTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => { factory.destroy(); });

    const importOptions = {};
    const chummerFile = {
        characters: {
            character: {},
        },
    } as ActorFile;

    describe('Chummer Character Importer', () => {
        it('Does nothing when no character found', async () => {
            const item = await factory.createItem({ type: 'weapon' });
            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await character.createEmbeddedDocuments('Item', [item]);
            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, {} as ActorFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all imported items', async () => {
            const item = await factory.createItem({ type: 'weapon' });
            await item.update({ system: { importFlags: { isImported: true } } });

            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.isEmpty(character.items);
        });

        it('Clears all items but not imported ones', async () => {
            const item = await factory.createItem({ type: 'weapon' });

            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await character.createEmbeddedDocuments('Item', [item]);

            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
        });

        it('Clears all items but actions', async () => {
            const item = await factory.createItem({ type: 'action' });
            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await character.createEmbeddedDocuments('Item', [item]);
            
            assert.lengthOf(character.items, 1);

            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);
        });

        it('Clears all items but effects', async () => {
            const item = await factory.createItem({ type: 'weapon' });
            void item.createEmbeddedDocuments('ActiveEffect', [{
                origin: item.uuid,
                disabled: false,
                name: 'Test Effect',
                changes: [
                    { key: 'system.attributes.body.mod', value: '2', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM },
                    { key: 'system.attributes.body', value: '2', mode: CONST.ACTIVE_EFFECT_MODES.CUSTOM }
                ]
            }]);
            const character = await factory.createActor({ type: 'character', system: { metatype: 'human' } });
            await character.createEmbeddedDocuments('Item', [item]);
            await new CharacterImporter().importChummerCharacter(character, chummerFile, importOptions);

            assert.lengthOf(character.items, 1);
            assert.strictEqual(character.items.contents[0].name, item.name);
            assert.strictEqual(character.items.contents[0].type, item.type);

        });
    });
};
