import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { Helpers } from '@/module/helpers';
import { TestCreator } from '@/module/tests/TestCreator';
import { SR5Actor } from '@/module/actor/SR5Actor';
import { SR5TestFactory } from './utils';
import { OpposedSummonSpiritTest } from '@/module/tests/OpposedSummonSpiritTest';
import { OpposedCompileSpriteTest } from '@/module/tests/OpposedCompileSpriteTest';

type OpposedCallInClass = typeof OpposedSummonSpiritTest | typeof OpposedCompileSpriteTest;

function createOpposedTestData(opposedType: string, againstType: string) {
    const data = TestCreator._minimalTestData();
    data.type = opposedType;
    data.previousMessageId = 'test-message-id';
    data.against = TestCreator._minimalTestData();
    data.against.type = againstType;
    return data;
}

function createAgainstData(sourceActorUuid = '', sourceUuid = '') {
    const data = TestCreator._minimalTestData();
    data.sourceActorUuid = sourceActorUuid;
    data.sourceUuid = sourceUuid;
    return data;
}

async function runWithPatches(
    cls: OpposedCallInClass,
    againstType: string,
    selectedActors: SR5Actor[],
    againstData: any,
): Promise<{ capturedDocument: any; executeCount: number; getOpposedCount: number }> {
    const clsAny = cls as any;
    const originalGetOpposed = clsAny._getOpposedActionTestData;
    const originalExecute = cls.prototype.execute;
    const originalSelectedActors = Helpers.getSelectedActorsOrCharacter;

    let capturedDocument: any = null;
    let executeCount = 0;
    let getOpposedCount = 0;

    clsAny._getOpposedActionTestData = async (_againstData, document) => {
        capturedDocument = document;
        getOpposedCount += 1;
        return createOpposedTestData(cls.name, againstType);
    };

    cls.prototype.execute = async function () {
        executeCount += 1;
        return this as any;
    };

    Helpers.getSelectedActorsOrCharacter = () => selectedActors;

    try {
        await cls.executeMessageAction(againstData, 'test-message-id', { showDialog: false, showMessage: false });
    } finally {
        clsAny._getOpposedActionTestData = originalGetOpposed;
        cls.prototype.execute = originalExecute;
        Helpers.getSelectedActorsOrCharacter = originalSelectedActors;
    }

    return { capturedDocument, executeCount, getOpposedCount };
}

export const shadowrunOpposedCallInMessageActionTesting = (context: QuenchBatchContext) => {
    const factory = new SR5TestFactory();
    const { describe, it, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    after(async () => {
        await factory.destroy();
    });

    const scenarios: { label: string; cls: OpposedCallInClass; againstType: string }[] = [
        { label: 'summoning', cls: OpposedSummonSpiritTest, againstType: 'SummonSpiritTest' },
        { label: 'compilation', cls: OpposedCompileSpriteTest, againstType: 'CompileSpriteTest' },
    ];

    for (const { label, cls, againstType } of scenarios) {
        describe(`Opposed ${label} message action`, () => {
            it('executes once using sourceActorUuid without selected actors', async () => {
                const sourceActor = await factory.createActor({ type: 'character' });
                const againstData = createAgainstData(sourceActor.uuid || '', '');

                const result = await runWithPatches(cls, againstType, [], againstData);

                assert.strictEqual(result.executeCount, 1);
                assert.strictEqual(result.getOpposedCount, 1);
                assert.strictEqual(result.capturedDocument?.uuid, sourceActor.uuid);
            });

            it('shows error and does not execute when all resolution paths are empty', async () => {
                const originalCharacterId = game.user?.character?.id ?? null;
                await game.user?.update({ character: null } as any);

                const notifications = ui.notifications as any;
                const originalError = notifications?.error;
                let errors = 0;
                notifications.error = () => {
                    errors += 1;
                };

                try {
                    const againstData = createAgainstData('', '');
                    const result = await runWithPatches(cls, againstType, [], againstData);

                    assert.strictEqual(result.executeCount, 0);
                    assert.strictEqual(result.getOpposedCount, 0);
                    assert.strictEqual(errors, 1);
                } finally {
                    notifications.error = originalError;
                    await game.user?.update({ character: originalCharacterId } as any);
                }
            });
        });
    }
};
