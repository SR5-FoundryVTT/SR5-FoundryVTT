/** The result of evaluating a dynamic change value. */
export type DynamicValue = number | boolean | string;

/**
 * Evaluate the small expression language used by dynamic Active Effect change values.
 *
 * Supports number literals, true/false, quoted string literals, @property references, + - * / %,
 * unary +/-, logical not (!), parentheses, comparisons, the logical operators && and ||,
 * ternaries, array literals with numeric indexing ('[100, 200, 300][2]') and a fixed set of Math
 * functions. Evaluation is total: input that isn't a valid expression is returned verbatim as a
 * string, so a plain value like 'physical' comes back unchanged.
 *
 * @property references are resolved through an optional resolver passed to evaluate, keeping the
 * types of string and boolean references intact (Roll.replaceFormulaData, by contrast, substitutes
 * strings unquoted and coerces booleans to 1/0). Without a resolver, a reference is an unknown
 * token and the input falls through verbatim.
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

    /**
     * Binary operators. Ordering and arithmetic require numeric operands and assert as much;
     * equality compares without coercion so 'true == true' holds. Comparisons yield booleans.
     */
    private static readonly OPERATORS: Record<string, (left: DynamicValue, right: DynamicValue) => DynamicValue> = {
        '<': (left, right) => DynamicValueEvaluator.number(left) < DynamicValueEvaluator.number(right),
        '<=': (left, right) => DynamicValueEvaluator.number(left) <= DynamicValueEvaluator.number(right),
        '>': (left, right) => DynamicValueEvaluator.number(left) > DynamicValueEvaluator.number(right),
        '>=': (left, right) => DynamicValueEvaluator.number(left) >= DynamicValueEvaluator.number(right),
        '==': (left, right) => left === right,
        '===': (left, right) => left === right,
        '!=': (left, right) => left !== right,
        '!==': (left, right) => left !== right,
        '+': (left, right) => DynamicValueEvaluator.number(left) + DynamicValueEvaluator.number(right),
        '-': (left, right) => DynamicValueEvaluator.number(left) - DynamicValueEvaluator.number(right),
        '*': (left, right) => DynamicValueEvaluator.number(left) * DynamicValueEvaluator.number(right),
        '/': (left, right) => DynamicValueEvaluator.number(left) / DynamicValueEvaluator.number(right),
        '%': (left, right) => DynamicValueEvaluator.number(left) % DynamicValueEvaluator.number(right),
        '&&': (left, right) => DynamicValueEvaluator.truthy(left) && DynamicValueEvaluator.truthy(right),
        '||': (left, right) => DynamicValueEvaluator.truthy(left) || DynamicValueEvaluator.truthy(right),
    };

    /** Binary operators grouped into precedence levels, loosest binding first. */
    private static readonly PRECEDENCE = [
        ['||'],
        ['&&'],
        ['<', '<=', '>', '>=', '==', '===', '!=', '!=='],
        ['+', '-'],
        ['*', '/', '%'],
    ];

    /** Bounds parse cost, as evaluation runs per change, per effect, on every data preparation. */
    private static readonly MAX_LENGTH = 512;

    /**
     * Matches a single token, skipping leading whitespace. Order matters: string literals first,
     * references before numbers, and multi-character operators before the single-character class
     * so '!=' and '!==' win over '!'. Anything this can't match - backticks, dice notation, a bare
     * '.' - fails the parse, so evaluate returns the input verbatim as a string.
     */
    private static readonly TOKEN =
        /\s*('[^']*'|"[^"]*"|@\{[-.\w]+\}|@[-.\w]+|\d+(?:\.\d+)?|<=|>=|===|!==|==|!=|&&|\|\||[-+*/%()[\],?:<>!]|[A-Za-z_]\w*)/y;

    private readonly tokens: string[];
    private readonly resolve?: (path: string) => unknown;
    private pos = 0;

    /**
     * Evaluate an expression down to a single value.
     *
     * @param expression The expression to evaluate.
     * @param resolve Optional resolver mapping an @property path (without the leading @) to its
     *                value. Omit it and references become unknown tokens.
     * @returns The result, or the input verbatim when it isn't a valid expression.
     */
    static evaluate(expression: string, resolve?: (path: string) => unknown): DynamicValue {
        try {
            return new DynamicValueEvaluator(expression, resolve).parse();
        } catch {
            // Not an expression, so the text is the value itself (e.g. 'physical').
            return expression;
        }
    }

    /** Assert a value is numeric, for operators and positions that only accept numbers. */
    private static number(value: DynamicValue): number {
        if (typeof value !== 'number') throw new Error(`Expected a number, got '${value}'.`);
        return value;
    }

    /**
     * Coerce a value used as a condition. A number is truthy when non-zero, which is how
     * Roll.replaceFormulaData delivers boolean @refs (as 1 or 0).
     */
    private static truthy(value: DynamicValue): boolean {
        if (typeof value === 'boolean') return value;
        return DynamicValueEvaluator.number(value) !== 0;
    }

    private constructor(expression: string, resolve?: (path: string) => unknown) {
        if (expression.length > DynamicValueEvaluator.MAX_LENGTH)
            throw new Error(`Expression exceeds ${DynamicValueEvaluator.MAX_LENGTH} characters.`);

        this.tokens = DynamicValueEvaluator.tokenize(expression);
        this.resolve = resolve;
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

    private parse(): DynamicValue {
        const value = this.ternary();
        if (this.pos < this.tokens.length) throw new Error(`Unexpected token '${this.peek()}'.`);
        return value;
    }

    /** cond ? a : b, right associative. Branches may be any type and needn't match. */
    private ternary(): DynamicValue {
        const condition = this.binary();
        if (this.peek() !== '?') return condition;

        this.next();
        const whenTrue = this.ternary();
        this.expect(':');
        const whenFalse = this.ternary();

        return DynamicValueEvaluator.truthy(condition) ? whenTrue : whenFalse;
    }

    /** Left associative binary operators, one PRECEDENCE level per recursion. */
    private binary(level = 0): DynamicValue {
        const operators = DynamicValueEvaluator.PRECEDENCE[level];
        if (!operators) return this.unary();

        let value = this.binary(level + 1);
        while (operators.includes(this.peek())) {
            const apply = DynamicValueEvaluator.OPERATORS[this.next()];
            value = apply(value, this.binary(level + 1));
        }

        return value;
    }

    private unary(): DynamicValue {
        if (this.peek() === '-') {
            this.next();
            return -DynamicValueEvaluator.number(this.unary());
        }
        if (this.peek() === '+') {
            this.next();
            return DynamicValueEvaluator.number(this.unary());
        }
        if (this.peek() === '!') {
            this.next();
            return !DynamicValueEvaluator.truthy(this.unary());
        }

        return this.primary();
    }

    private primary(): DynamicValue {
        const token = this.next();
        if (token === undefined) throw new Error('Unexpected end of expression.');

        if (/^\d/.test(token)) return Number(token);
        if (token === 'true') return true;
        if (token === 'false') return false;
        if (token.startsWith('\'') || token.startsWith('"')) return token.slice(1, -1);
        if (token.startsWith('@')) return this.reference(token);

        if (token === '(') {
            const value = this.ternary();
            this.expect(')');
            return value;
        }

        if (token === '[') return this.lookup();

        if (token in DynamicValueEvaluator.FUNCTIONS) {
            this.expect('(');
            const args = this.list(')').map(value => DynamicValueEvaluator.number(value));
            return DynamicValueEvaluator.FUNCTIONS[token](...args);
        }

        throw new Error(`Unknown token '${token}'.`);
    }

    /**
     * Resolve an @property reference to a typed value. Only primitives are usable in an
     * expression; a missing reference or a non-primitive throws, so evaluate falls through to
     * returning the input verbatim and the change is dropped.
     */
    private reference(token: string): DynamicValue {
        if (!this.resolve) throw new Error('No resolver for references.');

        const path = token.replace(/^@\{?|\}$/g, '');
        const value = this.resolve(path);

        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim();
        throw new Error(`Reference '${token}' did not resolve to a primitive.`);
    }

    /**
     * '[a, b, c][index]' - an array literal is only ever a lookup table, so it must be indexed
     * immediately and can never escape as a value of its own.
     */
    private lookup(): DynamicValue {
        const values = this.list(']');
        this.expect('[');
        const index = DynamicValueEvaluator.number(this.ternary());
        this.expect(']');

        if (!Number.isInteger(index) || index < 0 || index >= values.length)
            throw new Error(`Index ${index} out of range.`);

        return values[index];
    }

    /** Parse a comma separated list of values up to and including the closing token. */
    private list(closing: string): DynamicValue[] {
        const values: DynamicValue[] = [];

        if (this.peek() !== closing) {
            do {
                values.push(this.ternary());
            } while (this.peek() === ',' && this.next());
        }

        this.expect(closing);
        return values;
    }
}
