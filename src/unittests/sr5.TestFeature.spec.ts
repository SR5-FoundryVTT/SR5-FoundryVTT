import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { TestCreator } from '@/module/tests/TestCreator';
import { ModifiableValue } from '@/module/mods/ModifiableValue';
import { TestFeature, TestFeatureRules, TestFeatures } from '@/module/tests/features/TestFeature';
import { TEST_PIPELINE_STAGES } from '@/module/tests/TestMode';
import { SuccessTest } from '@/module/tests/SuccessTest';
import { SR5TestFactory } from './utils';

/**
 * The feature stage loop of SuccessTest, independent of any concrete feature.
 */
export const shadowrunTestFeatures = (context: QuenchBatchContext) => {
    const { describe, it, before, after } = context;
    const assert: Chai.AssertStatic = context.assert;

    const calls: string[] = [];
    const spikeFeatures: TestFeature[] = [
        {
            id: 'spikeDice',
            prepareDocuments: async () => { calls.push('prepareDocuments'); },
            prepareValues: test => { ModifiableValue.addUniqueBase(test.data.pool, 'SpikeDice', 2); },
            consume: async () => { calls.push('consume'); return true; },
            process: async () => { calls.push('process'); },
        },
        { id: 'spikeNoEdge', edge: { secondChance: false, pushTheLimit: false } },
        { id: 'spikeAlwaysSucceeds', outcome: () => ({ success: true }) },
        { id: 'spikeBlocks', consume: async () => false },
        { id: 'spikeLate', after: ['spikeDice'] },
    ];

    before(() => { for (const feature of spikeFeatures) TestFeatures[feature.id] = feature; });
    after(() => { for (const feature of spikeFeatures) delete TestFeatures[feature.id]; });

    const pool = (dice: number, features: string[]) => {
        const test = TestCreator.fromPool({ pool: dice }, { showMessage: false, showDialog: false });
        test.data.features = features;
        return test;
    };

    describe('Feature ids', () => {
        it('adds and removes features by prefix', () => {
            assert.deepEqual(TestFeatureRules.resolveIds(['a', 'b'], ['+c', '-a', 'd', '+b']), ['b', 'c', 'd']);
        });

        it('orders features by their dependencies', () => {
            const ids = TestFeatureRules.resolve(['spikeLate', 'spikeDice']).map(feature => feature.id);
            assert.deepEqual(ids, ['spikeDice', 'spikeLate']);
        });
    });

    describe('Stages', () => {
        it('runs all stages of the features a test uses', async () => {
            calls.length = 0;
            const test = pool(4, ['+spikeDice']);
            await test.execute();

            assert.deepEqual(calls, ['prepareDocuments', 'consume', 'process']);
            assert.strictEqual(test.pool.value, 6);
            assert.deepInclude(test.featureTrace, { stage: 'prepareValues', feature: 'spikeDice' });
        });

        it('leaves tests without features alone', async () => {
            calls.length = 0;
            const test = pool(4, []);
            await test.execute();

            assert.isEmpty(calls);
            assert.strictEqual(test.pool.value, 4);
        });

        it('stops a test whose feature can not consume', async () => {
            const test = pool(4, ['+spikeBlocks']);
            await test.execute();
            assert.isFalse(test.evaluated);
        });

        it('lets a feature decide the outcome', async () => {
            const test = pool(0, ['+spikeAlwaysSucceeds']);
            await test.execute();
            assert.isTrue(test.success);
        });

        it('disallows edge rules', async () => {
            const test = pool(4, ['+spikeNoEdge']);
            await test.execute();
            assert.isFalse(test.canSecondChance);
            assert.isFalse(test.canPushTheLimit);
        });
    });

    describe('Pipeline', () => {
        const factory = new SR5TestFactory();
        after(async () => { await factory.destroy(); });

        const stagesOf = async (callback: () => Promise<unknown>) => {
            const stages: string[] = [];
            const id = Hooks.on('sr5_testStage', (_test: unknown, stage: string) => { stages.push(stage); });
            try {
                await callback();
            } finally {
                Hooks.off('sr5_testStage', id);
            }
            return stages.filter(stage => (TEST_PIPELINE_STAGES as readonly string[]).includes(stage));
        };

        const actorTest = async (dice: number) => {
            const actor = await factory.createActor({ type: 'character', system: { attributes: { edge: { base: 3, uses: 3 } } } });
            const data = TestCreator._minimalTestData();
            data.pool.base = dice;
            return { actor, test: new SuccessTest(data, { actor }, { showDialog: false, showMessage: false }) };
        };

        it('runs all stages in order', async () => {
            const test = pool(3, []);
            const stages = await stagesOf(() => test.execute());
            assert.deepEqual(stages, [...TEST_PIPELINE_STAGES]);
        });

        it('stops at the first stage that can not continue', async () => {
            const test = pool(3, ['+spikeBlocks']);
            const stages = await stagesOf(() => test.execute());
            assert.deepEqual(stages, ['prepare', 'check', 'dialog']);
        });

        it('pushes the limit after rolling, spending edge once', async () => {
            const { actor, test } = await actorTest(4);
            await test.execute();
            await test.executeWithPushTheLimit();

            assert.strictEqual(ModifiableValue.calcTotal(test.data.pool), 4 + actor.getEdge().value);
            assert.strictEqual(test.rolls.length, 2);
            assert.isFalse(test.hasPushTheLimit);
            assert.strictEqual(actor.getEdge().uses, 2);
        });

        it('rerolls dice without hits with second chance', async () => {
            const { actor, test } = await actorTest(6);
            await test.execute();
            // A glitch or a roll without misses can't use second chance, make sure there are misses to reroll.
            Object.defineProperty(test, 'glitched', { get: () => false });
            const misses = test.rolls[0].poolThrown - test.rolls[0].hits;
            if (misses === 0) return;

            await test.executeWithSecondChance();

            assert.strictEqual(test.rolls.length, 2);
            assert.isFalse(test.hasSecondChance);
            assert.strictEqual(actor.getEdge().uses, 2);
        });
    });
};
