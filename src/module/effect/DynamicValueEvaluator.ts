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
 * indexing, which is exactly what the rating lookup tables need.
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

    /** Bounds parse cost, as evaluation runs per change, per effect, on every data preparation. */
    private static readonly MAX_LENGTH = 500;

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

    /**
     * Assert a value is numeric. Array literals only exist to be indexed, so they're rejected
     * everywhere an operand is expected.
     */
    private numeric(value: number | number[]): number {
        if (typeof value !== 'number') throw new Error('Expression is not numeric.');
        return value;
    }

    private parse(): number {
        const value = this.ternary();
        if (this.pos < this.tokens.length) throw new Error(`Unexpected token '${this.peek()}'.`);
        return this.numeric(value);
    }

    /** cond ? a : b, right associative. */
    private ternary(): number | number[] {
        const condition = this.comparison();
        if (this.peek() !== '?') return condition;

        this.next();
        const whenTrue = this.ternary();
        this.expect(':');
        const whenFalse = this.ternary();

        return this.numeric(condition) !== 0 ? whenTrue : whenFalse;
    }

    /** Comparisons resolve to 1 or 0, so they can be used as ternary conditions and operands. */
    private comparison(): number | number[] {
        const comparators: Record<string, (left: number, right: number) => boolean> = {
            '<': (left, right) => left < right,
            '<=': (left, right) => left <= right,
            '>': (left, right) => left > right,
            '>=': (left, right) => left >= right,
            '==': (left, right) => left === right,
            '===': (left, right) => left === right,
            '!=': (left, right) => left !== right,
            '!==': (left, right) => left !== right,
        };

        let value = this.additive();
        while (this.peek() in comparators) {
            const comparator = comparators[this.next()];
            value = comparator(this.numeric(value), this.numeric(this.additive())) ? 1 : 0;
        }

        return value;
    }

    private additive(): number | number[] {
        let value = this.multiplicative();
        while (this.peek() === '+' || this.peek() === '-') {
            const operator = this.next();
            const right = this.numeric(this.multiplicative());
            value = operator === '+' ? this.numeric(value) + right : this.numeric(value) - right;
        }

        return value;
    }

    private multiplicative(): number | number[] {
        let value = this.unary();
        while (this.peek() === '*' || this.peek() === '/' || this.peek() === '%') {
            const operator = this.next();
            const right = this.numeric(this.unary());
            const left = this.numeric(value);
            value = operator === '*' ? left * right : operator === '/' ? left / right : left % right;
        }

        return value;
    }

    private unary(): number | number[] {
        if (this.peek() === '-') {
            this.next();
            return -this.numeric(this.unary());
        }
        if (this.peek() === '+') {
            this.next();
            return this.numeric(this.unary());
        }

        return this.postfix();
    }

    /** Indexing, which is only allowed on an array literal with an in-range integer index. */
    private postfix(): number | number[] {
        let value = this.primary();

        while (this.peek() === '[') {
            this.next();
            const index = this.numeric(this.ternary());
            this.expect(']');

            if (!Array.isArray(value)) throw new Error('Only array literals can be indexed.');
            if (!Number.isInteger(index) || index < 0 || index >= value.length)
                throw new Error(`Index ${index} out of range.`);

            value = value[index];
        }

        return value;
    }

    private primary(): number | number[] {
        const token = this.next();
        if (token === undefined) throw new Error('Unexpected end of expression.');

        if (/^\d/.test(token)) return Number(token);

        if (token === '(') {
            const value = this.ternary();
            this.expect(')');
            return value;
        }

        if (token === '[') {
            const values = this.numericList(']');
            this.expect(']');
            return values;
        }

        if (token in DynamicValueEvaluator.FUNCTIONS) {
            this.expect('(');
            const args = this.numericList(')');
            this.expect(')');
            return DynamicValueEvaluator.FUNCTIONS[token](...args);
        }

        throw new Error(`Unknown token '${token}'.`);
    }

    /**
     * Parse a comma separated list of numbers, stopping at but not consuming the closing token.
     */
    private numericList(closing: string): number[] {
        const values: number[] = [];
        if (this.peek() === closing) return values;

        do {
            values.push(this.numeric(this.ternary()));
        } while (this.peek() === ',' && this.next());

        return values;
    }
}
