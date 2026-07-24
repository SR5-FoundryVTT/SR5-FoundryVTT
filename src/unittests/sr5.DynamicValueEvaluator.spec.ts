import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DynamicValueEvaluator } from '@/module/effect/DynamicValueEvaluator';

export const shadowrunDynamicValueEvaluator = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('DynamicValueEvaluator', () => {
        describe('accepts the expressions used by dynamic change values', () => {
            /**
             * Expressions reaching the evaluator have their @property references already
             * substituted by Roll.replaceFormulaData, so they're plain numbers here.
             */
            const accepted: [string, number][] = [
                // FixedValues lookup tables, indexed by rating.
                ['[100, 200, 300][2 - 1]', 200],
                ['[100,200,300][0]', 100],
                ['[1,2,3][1] * 2 + floor(5/2)', 6],
                // Rating arithmetic.
                ['500 * 3', 1500],
                ['(3 * 3)', 9],
                ['-0.1', -0.1],
                // Math functions.
                ['floor(7 / 2)', 3],
                ['max(1, 2, 3) + min(4, 5)', 7],
                ['pow(2, 3)', 8],
                // Comparisons and ternaries.
                ['3 >= 2 ? 10 : 20', 10],
                ['3 < 2 ? 10 : 20', 20],
                ['2 >= 2 ? [1,2][0] : 9', 1],
                // Surrounding whitespace, including the leading newline of a multiline value.
                ['  2 + 2  ', 4],
                ['\n2 + 2', 4],
            ];

            for (const [expression, expected] of accepted) {
                it(`evaluates ${JSON.stringify(expression)} to ${expected}`, () => {
                    assert.strictEqual(DynamicValueEvaluator.evaluate(expression), expected);
                });
            }
        });

        describe('rejects everything else', () => {
            const rejected: [string, string][] = [
                // Escapes that Roll.safeEval would have executed. The first reaches Function
                // through Math.constructor, the rest build it from array and string coercions
                // using only characters an arithmetic expression must allow.
                ['constructor.constructor(\'return 42\')()', 'reaching Function via constructor'],
                ['this', 'the sloppy mode global object'],
                ['(function(){while(true){}})()', 'an infinite loop'],
                ['[][\'fil\' + \'ter\'][\'const\' + \'ructor\'](\'return 1337\')()', 'computed member access'],
                ['(![]+[])[+[]]', 'character extraction from a coerced boolean'],
                ['[][[]]', 'indexing something that is not an array literal'],
                ['alert(1)', 'a function outside the allowlist'],
                // Values that are not expressions, which must be left for other appliers to handle.
                ['@system.technology.rating * 3', 'an unresolved property reference'],
                ['2d6', 'dice notation'],
                ['physical', 'a plain string value'],
                // Malformed input.
                ['[100,200][5]', 'an out of range index'],
                ['[100,200][-1]', 'a negative index'],
                ['1 + ', 'a missing operand'],
            ];

            for (const [expression, reason] of rejected) {
                it(`rejects ${JSON.stringify(expression)} - ${reason}`, () => {
                    assert.throws(() => DynamicValueEvaluator.evaluate(expression));
                });
            }

            it('rejects expressions beyond the length limit', () => {
                assert.throws(() => DynamicValueEvaluator.evaluate('1'.repeat(600)));
            });
        });

        it('never executes its input', () => {
            const marker = '__sr5DynamicValueEvaluatorMarker';
            try {
                DynamicValueEvaluator.evaluate(`constructor.constructor('globalThis.${marker} = true; return 1')()`);
            } catch {
                // Expected: the expression is rejected.
            }

            assert.isUndefined(globalThis[marker]);
        });
    });
};
