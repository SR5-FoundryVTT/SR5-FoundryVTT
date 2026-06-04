import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DataDefaults } from '@/module/data/DataDefaults';
import { TestCreator } from '@/module/tests/TestCreator';
import { OpposedCompileSpriteTest } from '@/module/tests/OpposedCompileSpriteTest';
import { SR5TestFactory } from './utils';
import { SR5Actor } from '@/module/actor/SR5Actor';

async function createOpposedCompileSpriteTest(
    technomancer: SR5Actor<'character'>,
    preparedSpriteUuid: string,
): Promise<OpposedCompileSpriteTest> {
    const againstData: any = TestCreator._minimalTestData();
    againstData.type = 'CompileSpriteTest';
    againstData.level = 4;
    againstData.preparedSpriteUuid = preparedSpriteUuid;
    againstData.fade = 0;
    againstData.fadeDamage = DataDefaults.createData('damage');
    againstData.action = DataDefaults.createData('action_roll');
    againstData.action.opposed.test = 'OpposedCompileSpriteTest';

    const data: any = TestCreator._minimalTestData();
    data.type = 'OpposedCompileSpriteTest';
    data.previousMessageId = 'test-message-id';
    data.against = againstData;

    const test = new OpposedCompileSpriteTest(
        data,
        { source: technomancer },
        { showDialog: false, showMessage: false }
    );

    test.against.actor = technomancer;
    return test;
}

export const shadowrunOpposedCompileSpriteTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => {
        await factory.destroy();
    });

    describe('OpposedCompileSprite Flow', () => {
        it('populateDocuments does not create a sprite actor', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const opposed = await createOpposedCompileSpriteTest(technomancer, '');

            const actorCountBefore = game.actors?.size ?? 0;
            await opposed.populateDocuments();
            const actorCountAfter = game.actors?.size ?? 0;

            assert.strictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore);
        });

        it('creates sprite only on successful compilation for prepared compendium sprites', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const preparedSprite = await factory.createActor({ type: 'sprite', name: 'Template Sprite' });

            const opposed = await createOpposedCompileSpriteTest(technomancer, 'Compendium.world.sr5e-sprites.fake');
            opposed.getPreparedSpriteActor = async () => preparedSprite as SR5Actor;

            const actorCountBefore = game.actors?.size ?? 0;

            await opposed.processFailure();

            const actorCountAfter = game.actors?.size ?? 0;

            assert.notStrictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore + 1);

            const createdSprite = await fromUuid<SR5Actor>(opposed.data.compiledSpriteUuid);
            assert.isOk(createdSprite);
            if (!createdSprite) return;

            factory.actors.push(createdSprite as Actor.Stored<'sprite'>);

            assert.strictEqual(createdSprite.name, `Compiled ${preparedSprite.name}`);
            assert.strictEqual(createdSprite.prototypeToken.actorLink, true);
            assert.strictEqual(createdSprite.system.technomancerUuid, technomancer.uuid);
        });

        it('updates prepared world sprite (editable) without cloning', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const preparedSprite = await factory.createActor({
                type: 'sprite',
                system: { technomancerUuid: '' },
            });

            const opposed = await createOpposedCompileSpriteTest(technomancer, preparedSprite.uuid);
            const actorCountBefore = game.actors?.size ?? 0;

            await opposed.processFailure();

            const actorCountAfter = game.actors?.size ?? 0;
            const updatedSprite = game.actors?.get(preparedSprite.id) as SR5Actor<'sprite'>;

            assert.strictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore);
            assert.strictEqual(updatedSprite.system.technomancerUuid, technomancer.uuid);
        });

        it('does not mutate non-editable prepared world sprite', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const preparedSprite = await factory.createActor({
                type: 'sprite',
                system: { technomancerUuid: '' },
            });

            const opposed = await createOpposedCompileSpriteTest(technomancer, preparedSprite.uuid);
            Object.defineProperty(opposed.against, 'preparedSpriteIsEditable', {
                get: () => false,
                configurable: true,
            });

            const actorCountBefore = game.actors?.size ?? 0;
            await opposed.processFailure();
            const actorCountAfter = game.actors?.size ?? 0;

            const updatedSprite = game.actors?.get(preparedSprite.id) as SR5Actor<'sprite'>;

            assert.strictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore);
            assert.strictEqual(updatedSprite.system.technomancerUuid, '');
        });

        it('does not create sprite when no prepared sprite is configured', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const opposed = await createOpposedCompileSpriteTest(technomancer, '');

            const actorCountBefore = game.actors?.size ?? 0;
            await opposed.processFailure();
            const actorCountAfter = game.actors?.size ?? 0;

            assert.strictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore);
        });

        it('compilation failure does not create or keep a sprite actor', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const preparedSprite = await factory.createActor({ type: 'sprite' });

            const opposed = await createOpposedCompileSpriteTest(technomancer, 'Compendium.world.sr5e-sprites.fake');
            opposed.getPreparedSpriteActor = async () => preparedSprite as SR5Actor;

            const actorCountBefore = game.actors?.size ?? 0;
            await opposed.processSuccess();
            const actorCountAfter = game.actors?.size ?? 0;

            assert.strictEqual(opposed.data.compiledSpriteUuid, '');
            assert.strictEqual(actorCountAfter, actorCountBefore);
        });

        it('propagates ownership to non-GM users linked to the technomancer', async () => {
            const technomancer = await factory.createActor({ type: 'character' });
            const opposed = await createOpposedCompileSpriteTest(technomancer, '');
            const updateData: any = { system: {} };

            const users = game.users as any;
            if (!users) throw new Error('Missing game.users');

            const originalFilter = users.filter;
            users.filter = (predicate: (user: any) => boolean) => {
                const fakeUsers = [
                    { id: 'non-gm', isGM: false, character: { uuid: technomancer.uuid } },
                    { id: 'gm', isGM: true, character: { uuid: technomancer.uuid } },
                    { id: 'other', isGM: false, character: { uuid: 'not-the-technomancer' } },
                ];
                return fakeUsers.filter(predicate);
            };

            try {
                opposed._addOwnershipToUpdateData(updateData);
            } finally {
                users.filter = originalFilter;
            }

            assert.strictEqual(updateData.ownership['non-gm'], CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER);
            assert.isUndefined(updateData.ownership['gm']);
            assert.isUndefined(updateData.ownership['other']);
        });
    });
};
