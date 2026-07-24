import { QuenchBatchContext } from '@ethaks/fvtt-quench';
import { DynamicValue, DynamicValueEvaluator } from '@/module/effect/DynamicValueEvaluator';

export const shadowrunDynamicValueEvaluator = (context: QuenchBatchContext) => {
    const { describe, it } = context;
    const assert: Chai.AssertStatic = context.assert;

    describe('DynamicValueEvaluator', () => {
        describe('accepts the expressions used by dynamic change values', () => {
            /**
             * Expressions reaching the evaluator have their @property references already
             * substituted by Roll.replaceFormulaData, so they're plain values here.
             */
            const accepted: [string, DynamicValue][] = [
                // FixedValues lookup tables, indexed by rating.
                ['[100, 200, 300][2 - 1]', 200],
                ['[100,200,300][0]', 100],
                ['[1,2,3][1] * 2 + floor(5/2)', 6],
                // Rating arithmetic.
                ['500 * 3', 1500],
                ['(3 * 3)', 9],
                ['-0.1', -0.1],
                // Operator precedence and left-associativity.
                ['2 + 3 * 4', 14],
                ['10 - 2 - 3', 5],
                ['20 / 2 / 5', 2],
                // Math functions.
                ['floor(7 / 2)', 3],
                ['max(1, 2, 3) + min(4, 5)', 7],
                ['pow(2, 3)', 8],
                // Booleans, from keywords and from comparisons.
                ['true', true],
                ['false', false],
                ['3 >= 2', true],
                ['3 < 2', false],
                ['1 == 1', true],
                ['1 != 2', true],
                ['true == true', true],
                // Logical operators, binding looser than comparisons.
                ['1 && 1', true],
                ['1 && 0', false],
                ['0 || 1', true],
                ['0 || 0', false],
                ['3 >= 2 && 1 < 5', true],
                ['3 < 2 || 4 > 1', true],
                ['1 && 0 ? 10 : 20', 20],
                // Logical not, binding as tightly as unary minus.
                ['!0', true],
                ['!1', false],
                ['!true', false],
                ['!(3 >= 2)', false],
                ['!!5', true],
                // String literals and string equality.
                ['\'physical\'', 'physical'],
                ['"stun"', 'stun'],
                ['\'a\' == \'a\'', true],
                ['\'a\' == \'b\'', false],
                ['1 == 1 ? \'physical\' : \'stun\'', 'physical'],
                ['[\'physical\',\'stun\'][1]', 'stun'],
                // Comparisons and ternaries.
                ['3 >= 2 ? 10 : 20', 10],
                ['3 < 2 ? 10 : 20', 20],
                ['2 >= 2 ? [1,2][0] : 9', 1],
                ['true ? 5 : 6', 5],
                ['0 ? 5 : 6', 6],
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

        describe('returns unparseable input verbatim', () => {
            /**
             * Evaluation is total: anything that isn't a valid expression comes back as the
             * original string, for the appliers to cast or reject by target type.
             */
            const verbatim: [string, string][] = [
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
                ['true * 2', 'arithmetic on a boolean'],
                ['\'a\' < \'b\'', 'ordering comparison on strings'],
                ['\'a\' + 1', 'concatenation - + is numeric only'],
                // Values that are not expressions, which appliers cast by target type.
                ['@system.technology.rating * 3', 'a reference with no resolver'],
                ['2d6', 'dice notation'],
                ['physical', 'a plain string value'],
                // Malformed input.
                ['[100,200][5]', 'an out of range index'],
                ['[100,200][-1]', 'a negative index'],
                ['1 + ', 'a missing operand'],
            ];

            for (const [expression, reason] of verbatim) {
                it(`returns ${JSON.stringify(expression)} unchanged - ${reason}`, () => {
                    assert.strictEqual(DynamicValueEvaluator.evaluate(expression), expression);
                });
            }

            it('returns input beyond the length limit unchanged', () => {
                const long = '1'.repeat(600);
                assert.strictEqual(DynamicValueEvaluator.evaluate(long), long);
            });
        });

        describe('resolves @property references with their types intact', () => {
            const data = {
                system: {
                    rating: 3,
                    wireless: true,
                    offline: false,
                    action: { damage: { type: { value: 'physical' } } },
                },
            };
            const resolve = (path: string) => foundry.utils.getProperty(data, path);

            const accepted: [string, DynamicValue][] = [
                ['@system.rating * 3', 9],
                ['@system.wireless', true],
                ['@system.offline', false],
                ['!@system.wireless', false],
                ['@system.wireless && @system.rating >= 3', true],
                ['@{system.rating}', 3],
                ['@system.action.damage.type.value == \'physical\'', true],
                ['@system.action.damage.type.value == \'stun\'', false],
                ['@system.action.damage.type.value == \'physical\' ? \'stun\' : \'physical\'', 'stun'],
            ];

            for (const [expression, expected] of accepted) {
                it(`evaluates ${JSON.stringify(expression)} to ${expected}`, () => {
                    assert.strictEqual(DynamicValueEvaluator.evaluate(expression, resolve), expected);
                });
            }

            it('returns the input verbatim when a reference is missing', () => {
                const expression = '@system.missing + 1';
                assert.strictEqual(DynamicValueEvaluator.evaluate(expression, resolve), expression);
            });
        });

        it('never executes its input', () => {
            const marker = '__sr5DynamicValueEvaluatorMarker';
            DynamicValueEvaluator.evaluate(`constructor.constructor('globalThis.${marker} = true; return 1')()`);

            assert.isUndefined(globalThis[marker]);
        });
    });
};
