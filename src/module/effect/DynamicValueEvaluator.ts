/**
 * Evaluate the small expression language used by dynamic Active Effect change values.
 *
 * Supports number literals, + - * / %, unary +/-, parentheses, comparisons, ternaries, array
 * literals with numeric indexing ('[100, 200, 300][2]') and a fixed set of Math functions.
 * Anything else is a syntax error.
 *
 * This exists instead of Roll.safeEval, which executes its argument as JavaScript via
 * 'new Function' and is not sandboxed: its Math proxy only rebinds bare identifiers, leaving
 * property access, 'this' and calls intact. Change values are attacker-controlled - players
 * author effects on their own documents, the Chummer importer writes imported XML into change
 * values, and module content ships effects - so safeEval allowed arbitrary code execution in
 * the GM's client and unrecoverable tab hangs through loops. Foundry's Roll parser is no
 * alternative either: its grammar reserves square brackets for flavor text and has no array
 * indexing, which is exactly what the lookup tables need.
 */
export class DynamicValueEvaluator {
    /**
     * Functions callable from an expression. Any other identifier is an unknown token.
     * Extend this when an importer starts emitting a construct that isn't covered.
     */
    private static readonly FUNCTIONS: Record<string, (...args: number[]) => number> = {
        abs: Math.abs,
        ceil: Math.ceil,
        floor: Math.floor,
        max: Math.max,
        min: Math.min,
        pow: Math.pow,
        round: Math.round,
        sign: Math.sign,
        trunc: Math.trunc,
    };

    /** Binary operators. Comparisons resolve to 1 or 0, so they can be used as operands. */
    private static readonly OPERATORS: Record<string, (left: number, right: number) => number> = {
        '<': (left, right) => Number(left < right),
        '<=': (left, right) => Number(left <= right),
        '>': (left, right) => Number(left > right),
        '>=': (left, right) => Number(left >= right),
        '==': (left, right) => Number(left === right),
        '===': (left, right) => Number(left === right),
        '!=': (left, right) => Number(left !== right),
        '!==': (left, right) => Number(left !== right),
        '+': (left, right) => left + right,
        '-': (left, right) => left - right,
        '*': (left, right) => left * right,
        '/': (left, right) => left / right,
        '%': (left, right) => left % right,
    };

    /** Binary operators grouped into precedence levels, loosest binding first. */
    private static readonly PRECEDENCE = [
        ['<', '<=', '>', '>=', '==', '===', '!=', '!=='],
        ['+', '-'],
        ['*', '/', '%'],
    ];

    /** Bounds parse cost, as evaluation runs per change, per effect, on every data preparation. */
    private static readonly MAX_LENGTH = 512;

    /**
     * Matches a single token, skipping leading whitespace. Anything this can't match - '@', '.',
     * quotes, backticks, '!', braces, dice notation - aborts evaluation.
     */
    private static readonly TOKEN = /\s*(\d+(?:\.\d+)?|<=|>=|===|!==|==|!=|[-+*/%()[\],?:<>]|[A-Za-z_]\w*)/y;

    private readonly tokens: string[];
    private pos = 0;

    /**
     * Evaluate an expression down to a single number.
     *
     * @param expression The expression, with all @property references already substituted.
     * @returns The numeric result.
     * @throws If the expression is malformed, uses unsupported syntax or isn't numeric.
     */
    static evaluate(expression: string): number {
        return new DynamicValueEvaluator(expression).parse();
    }

    private constructor(expression: string) {
        if (expression.length > DynamicValueEvaluator.MAX_LENGTH)
            throw new Error(`Expression exceeds ${DynamicValueEvaluator.MAX_LENGTH} characters.`);

        this.tokens = DynamicValueEvaluator.tokenize(expression);
    }

    private static tokenize(expression: string): string[] {
        const tokens: string[] = [];
        let index = 0;

        while (index < expression.length) {
            DynamicValueEvaluator.TOKEN.lastIndex = index;
            const match = DynamicValueEvaluator.TOKEN.exec(expression);

            // Trailing whitespace is fine, any other unmatched character isn't.
            if (!match) {
                if (!expression.slice(index).trim()) break;
                throw new Error(`Unexpected character '${expression[index]}' at position ${index}.`);
            }

            tokens.push(match[1]);
            index = DynamicValueEvaluator.TOKEN.lastIndex;
        }

        return tokens;
    }

    private peek() {
        return this.tokens[this.pos];
    }

    private next() {
        return this.tokens[this.pos++];
    }

    private expect(token: string) {
        if (this.next() !== token) throw new Error(`Expected '${token}'.`);
    }

    private parse(): number {
        const value = this.ternary();
        if (this.pos < this.tokens.length) throw new Error(`Unexpected token '${this.peek()}'.`);
        return value;
    }

    /** cond ? a : b, right associative. */
    private ternary(): number {
        const condition = this.binary();
        if (this.peek() !== '?') return condition;

        this.next();
        const whenTrue = this.ternary();
        this.expect(':');
        const whenFalse = this.ternary();

        return condition !== 0 ? whenTrue : whenFalse;
    }

    /** Left associative binary operators, one PRECEDENCE level per recursion. */
    private binary(level = 0): number {
        const operators = DynamicValueEvaluator.PRECEDENCE[level];
        if (!operators) return this.unary();

        let value = this.binary(level + 1);
        while (operators.includes(this.peek())) {
            const apply = DynamicValueEvaluator.OPERATORS[this.next()];
            value = apply(value, this.binary(level + 1));
        }

        return value;
    }

    private unary(): number {
        if (this.peek() === '-') {
            this.next();
            return -this.unary();
        }
        if (this.peek() === '+') {
            this.next();
            return this.unary();
        }

        return this.primary();
    }

    private primary(): number {
        const token = this.next();
        if (token === undefined) throw new Error('Unexpected end of expression.');

        if (/^\d/.test(token)) return Number(token);

        if (token === '(') {
            const value = this.ternary();
            this.expect(')');
            return value;
        }

        if (token === '[') return this.lookup();

        if (token in DynamicValueEvaluator.FUNCTIONS) {
            this.expect('(');
            return DynamicValueEvaluator.FUNCTIONS[token](...this.numbers(')'));
        }

        throw new Error(`Unknown token '${token}'.`);
    }

    /**
     * '[a, b, c][index]' - an array literal is only ever a lookup table, so it must be indexed
     * immediately and can never escape as a value of its own.
     */
    private lookup(): number {
        const values = this.numbers(']');
        this.expect('[');
        const index = this.ternary();
        this.expect(']');

        if (!Number.isInteger(index) || index < 0 || index >= values.length)
            throw new Error(`Index ${index} out of range.`);

        return values[index];
    }

    /** Parse a comma separated list of numbers up to and including the closing token. */
    private numbers(closing: string): number[] {
        const values: number[] = [];

        if (this.peek() !== closing) {
            do {
                values.push(this.ternary());
            } while (this.peek() === ',' && this.next());
        }

        this.expect(closing);
        return values;
    }
}
