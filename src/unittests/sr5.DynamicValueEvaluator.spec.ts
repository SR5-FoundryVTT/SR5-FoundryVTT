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
                ['sqrt(16)', 4],
                ['hypot(3, 4)', 5],
                ['log2(8)', 3],
                // Math constants, usable as bare identifiers.
                ['PI', Math.PI],
                ['floor(PI)', 3],
                ['E ** 0', 1],
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
                // Map lookups - string-keyed tables, indexed immediately like an array literal.
                ['{\'physical\': 10, \'stun\': 5}[\'physical\']', 10],
                ['{\'physical\': 10, \'stun\': 5}[\'stun\']', 5],
                ['{\'a\': 2 * 3, \'b\': 1}[\'a\']', 6],
                ['{\'a\': 1}[\'z\'] ?? 7', 7],
                ['{\'blade\': 10}[1 == 1 ? \'blade\' : \'blunt\']', 10],
                // Bare-word keys, and mixing them with quoted keys (needed for non-identifier keys).
                ['{physical: 10, stun: 5}[\'physical\']', 10],
                ['{blade: 1, \'exotic-melee\': 3}[\'exotic-melee\']', 3],
                // A bare key is a key, never a function/constant, even when it shadows one.
                ['{abs: 7, PI: 9}[\'abs\']', 7],
                // $name bindings - name a value once and reuse it, chaining allowed.
                ['$x = 5; $x + $x', 10],
                ['$x = 2; $y = $x + 1; $x * $y', 6],
                ['$x = 3; $x >= 2 ? $x * 10 : 0', 30],
                ['$x = 3; $x == 3', true],
                // Initializers retain their lexical scope even when a later binding shadows a name.
                ['$x = 1; $y = $x; $x = 2; $y', 1],
                ['$x = 1; $x = $x + 1; $x', 2],
                // The '$' sigil is its own namespace: '$PI'/'$floor' never collide with PI/floor.
                ['$PI = 3; $PI', 3],
                ['$PI = 3; $PI + PI', 3 + Math.PI],
                ['$floor = 2; $floor + floor(2.5)', 4],
                ['$true = 1; $true', 1],
                // The value is lazy, so a binding the body never reaches can't sink the expression.
                ['$x = [1][9]; true ? 5 : $x', 5],
                // A single trailing ';' is tolerated, on a binding or a plain expression.
                ['$x = 5; $x + $x;', 10],
                ['2 + 2;', 4],
                // Exponentiation - tighter than * and right-associative, looser than unary minus.
                ['2 ** 3', 8],
                ['2 ** 3 ** 2', 512],
                ['2 * 3 ** 2', 18],
                ['4 ** 0.5', 2],
                ['2 ** -2', 0.25],
                ['-2 ** 2', -4],
                ['-(2 ** 2)', -4],
                // Membership, binding like a comparison.
                ['2 in [1, 2, 3]', true],
                ['5 in [1, 2, 3]', false],
                ['\'blade\' in [\'blade\', \'blunt\']', true],
                ['\'exotic\' in [\'blade\', \'blunt\']', false],
                ['1 in []', false],
                ['2 in [1, 2] && 3 > 2', true],
                ['\'blade\' in [\'blade\'] ? 10 : 20', 10],
                // Fallback operator - the left when it evaluates, else the right.
                ['5 ?? 3', 5],
                ['0 ?? 3', 0],
                ['false ?? 3', false],
                ['\'a\' ?? \'b\'', 'a'],
                ['[1, 2][9] ?? 7', 7],
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
                ['random()', 'random is excluded to keep evaluation deterministic'],
                ['PI()', 'a constant is a value, not a callable'],
                // Inherited Object.prototype members must not be callable or usable as operators.
                ['constructor(1)', 'the inherited constructor'],
                ['toString(1)', 'the inherited toString'],
                ['valueOf(1)', 'the inherited valueOf'],
                ['hasOwnProperty(1)', 'an inherited method'],
                ['toString 5', 'an inherited name as a prefix operator'],
                ['true * 2', 'arithmetic on a boolean'],
                ['\'a\' < \'b\'', 'ordering comparison on strings'],
                ['\'a\' + 1', 'concatenation - + is numeric only'],
                ['2 in 3', 'membership without a bracketed list'],
                ['\'a\' ** 2', 'exponentiation on a string'],
                // Values that are not expressions, which appliers cast by target type.
                ['@system.technology.rating * 3', 'a reference with no resolver'],
                ['2d6', 'dice notation'],
                ['physical', 'a plain string value'],
                // Malformed input.
                ['[100,200][5]', 'an out of range index'],
                ['[100,200][-1]', 'a negative index'],
                ['{\'a\': 1}[\'b\']', 'a missing map key'],
                ['{\'a\': 1}[2]', 'a non-string lookup key'],
                ['{1: \'a\'}[\'1\']', 'a numeric object key - use an array for numeric indexing'],
                ['$x = 5 $x', 'a binding with no separating semicolon'],
                ['$= 5; 1', 'a binding with no name'],
                ['$x = $x; 1', 'a self-referencing binding value'],
                ['2 + 2;;', 'more than one trailing separator'],
                ['$x = 5;', 'a binding with no body'],
                ['1 + ', 'a missing operand'],
                ['[1][9] ?? [1][9]', 'a ?? where both sides fail'],
            ];

            for (const [expression, reason] of verbatim) {
                it(`returns ${JSON.stringify(expression)} unchanged - ${reason}`, () => {
                    assert.strictEqual(DynamicValueEvaluator.evaluate(expression), expression);
                });
            }

            it('returns input beyond the length limit unchanged', () => {
                const long = '1'.repeat(2000);
                assert.strictEqual(DynamicValueEvaluator.evaluate(long), long);
            });
        });

        describe('short-circuits ternaries and logical operators', () => {
            // The branch or operand not taken is never evaluated, so an error there - an
            // out-of-range lookup, a missing reference - can't sink the whole expression.
            const accepted: [string, DynamicValue][] = [
                ['true ? 1 : [1][99]', 1],
                ['false ? [1][99] : 2', 2],
                ['1 < 2 ? 10 : [0][5]', 10],
                ['false && [1][99]', false],
                ['true || [1][99]', true],
                ['0 && [1][99]', false],
                ['1 || [1][99]', true],
                ['5 ?? [1][99]', 5],
            ];

            for (const [expression, expected] of accepted) {
                it(`evaluates ${JSON.stringify(expression)} to ${expected}`, () => {
                    assert.strictEqual(DynamicValueEvaluator.evaluate(expression), expected);
                });
            }

            it('does not resolve a reference in the branch it skips', () => {
                const resolve = (path: string) => (path === 'ok' ? 1 : (() => { throw new Error('resolved a skipped ref'); })());
                assert.strictEqual(DynamicValueEvaluator.evaluate('@ok >= 1 ? @ok : @missing', resolve), 1);
                assert.strictEqual(DynamicValueEvaluator.evaluate('@ok >= 1 || @missing', resolve), true);
            });
        });

        describe('resolves @property references with their types intact', () => {
            const data = {
                system: {
                    rating: 3,
                    wireless: true,
                    offline: false,
                    category: 'blade',
                    action: { damage: { type: { value: 'physical' } } },
                },
            };
            const resolve = (path: string) => foundry.utils.getProperty(data, path);

            const accepted: [string, DynamicValue][] = [
                ['@system.rating * 3', 9],
                ['@system.rating ** 2', 9],
                ['$x = @system.rating * 2; $x >= 4 ? $x : 0', 6],
                ['@system.wireless', true],
                ['@system.offline', false],
                ['!@system.wireless', false],
                ['@system.wireless && @system.rating >= 3', true],
                ['@{system.rating}', 3],
                ['{\'blade\': 10, \'blunt\': 5}[@system.category]', 10],
                ['@system.category in [\'blade\', \'blunt\']', true],
                ['@system.category in [\'exotic\']', false],
                ['@system.action.damage.type.value == \'physical\'', true],
                ['@system.action.damage.type.value == \'stun\'', false],
                ['@system.action.damage.type.value == \'physical\' ? \'stun\' : \'physical\'', 'stun'],
                ['@system.missing ?? 5', 5],
                ['@system.rating ?? 5', 3],
                ['@system.offline ?? 5', false],
                ['@system.missing ?? @system.rating ?? 0', 3],
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
