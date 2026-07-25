/** The result of evaluating a dynamic change value. */
export type DynamicValue = number | boolean | string;

/** A node in the parsed expression tree. */
type Node =
    | { kind: 'value'; value: DynamicValue }
    | { kind: 'ref'; token: string; path: string }
    | { kind: 'bind'; name: string; value: Node; body: Node }
    | { kind: 'var'; name: string }
    | { kind: 'unary'; op: string; operand: Node }
    | { kind: 'binary'; op: string; left: Node; right: Node }
    | { kind: 'ternary'; condition: Node; whenTrue: Node; whenFalse: Node }
    | { kind: 'in'; value: Node; list: Node[] }
    | { kind: 'lookup'; values: Node[]; index: Node }
    | { kind: 'objectLookup'; entries: { key: string; value: Node }[]; key: Node }
    | { kind: 'call'; fn: string; args: Node[] };

type Environment = ReadonlyMap<string, () => DynamicValue>;

/**
 * Safely evaluates dynamic Active Effect values without executing JavaScript.
 *
 * Supports:
 * - Numbers, booleans, quoted strings, and `@property` references
 * - Arithmetic, comparisons, logic, and ternaries
 * - Membership with `in`
 * - Array and map lookup tables
 * - Lazy `$name` bindings
 * - Allowlisted Math functions and constants
 *
 * Invalid expressions are returned unchanged. Conditional operators short-circuit.
 *
 * Hyphens belong to reference paths, so subtraction after a reference needs whitespace:
 * `@rating - 1`.
 */
export class DynamicValueEvaluator {
    /** Math functions allowed in expressions. */
    private static readonly FUNCTIONS: Record<string, (...args: number[]) => number> = {
        abs: Math.abs,
        acos: Math.acos,
        acosh: Math.acosh,
        asin: Math.asin,
        asinh: Math.asinh,
        atan: Math.atan,
        atan2: Math.atan2,
        atanh: Math.atanh,
        cbrt: Math.cbrt,
        ceil: Math.ceil,
        cos: Math.cos,
        cosh: Math.cosh,
        exp: Math.exp,
        floor: Math.floor,
        hypot: Math.hypot,
        log: Math.log,
        log10: Math.log10,
        log2: Math.log2,
        max: Math.max,
        min: Math.min,
        pow: Math.pow,
        round: Math.round,
        sign: Math.sign,
        sin: Math.sin,
        sinh: Math.sinh,
        sqrt: Math.sqrt,
        tan: Math.tan,
        tanh: Math.tanh,
        trunc: Math.trunc,
    };

    /** Math constants allowed as bare identifiers, such as `PI`. */
    private static readonly CONSTANTS: Record<string, number> = {
        E: Math.E,
        LN10: Math.LN10,
        LN2: Math.LN2,
        LOG10E: Math.LOG10E,
        LOG2E: Math.LOG2E,
        PI: Math.PI,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
    };

    /** Non-short-circuiting binary operators. Arithmetic requires finite numbers. */
    private static readonly OPERATORS: Record<string, (left: DynamicValue, right: DynamicValue) => DynamicValue> = {
        '<': DynamicValueEvaluator.numeric((a, b) => a < b),
        '<=': DynamicValueEvaluator.numeric((a, b) => a <= b),
        '>': DynamicValueEvaluator.numeric((a, b) => a > b),
        '>=': DynamicValueEvaluator.numeric((a, b) => a >= b),
        '==': (left, right) => left === right,
        '===': (left, right) => left === right,
        '!=': (left, right) => left !== right,
        '!==': (left, right) => left !== right,
        '+': DynamicValueEvaluator.numeric((a, b) => a + b),
        '-': DynamicValueEvaluator.numeric((a, b) => a - b),
        '*': DynamicValueEvaluator.numeric((a, b) => a * b),
        '/': DynamicValueEvaluator.numeric((a, b) => a / b),
        '%': DynamicValueEvaluator.numeric((a, b) => a % b),
        '**': DynamicValueEvaluator.numeric((a, b) => a ** b),
    };

    /** Prefix operators. */
    private static readonly UNARY: Record<string, (value: DynamicValue) => DynamicValue> = {
        '-': value => -DynamicValueEvaluator.number(value),
        '+': value => DynamicValueEvaluator.number(value),
        '!': value => !DynamicValueEvaluator.truthy(value),
    };

    /** Binary precedence from lowest to highest. Exponentiation is parsed separately. */
    private static readonly PRECEDENCE = [
        ['??'],
        ['||'],
        ['&&'],
        ['<', '<=', '>', '>=', '==', '===', '!=', '!==', 'in'],
        ['+', '-'],
        ['*', '/', '%'],
    ];

    /** Maximum accepted expression length. */
    private static readonly MAX_LENGTH = 1024;

    /** Matches one token and leading whitespace. Token order gives longer forms priority. */
    private static readonly TOKEN =
        /\s*('[^']*'|"[^"]*"|@[-.\w]+|\$[A-Za-z_]\w*|\d+(?:\.\d+)?|<=|>=|===|!==|==|!=|&&|\|\||\?\?|\*\*|[-+*/%(){}[\],?:<>!=;]|[A-Za-z_]\w*)/y;

    private readonly tokens: string[];
    private readonly resolve?: (path: string) => unknown;
    private readonly ast: Node;
    private pos = 0;

    /** Names visible at the current parse position. */
    private readonly scope = new Set<string>();

    /**
     * Evaluate an expression, optionally resolving `@property` paths.
     * Returns the original text if parsing or evaluation fails.
     */
    static evaluate(expression: string, resolve?: (path: string) => unknown): DynamicValue {
        try {
            return new DynamicValueEvaluator(expression, resolve).run();
        } catch {
            // Plain or invalid values remain unchanged.
            return expression;
        }
    }

    /** Require a finite number. */
    private static number(value: DynamicValue): number {
        if (typeof value !== 'number' || !Number.isFinite(value))
            throw new Error(`Expected a finite number, got '${value}'.`);
        return value;
    }

    /** Wrap an operation that requires numeric operands. */
    private static numeric(op: (a: number, b: number) => DynamicValue) {
        return (left: DynamicValue, right: DynamicValue): DynamicValue =>
            DynamicValueEvaluator.finite(op(DynamicValueEvaluator.number(left), DynamicValueEvaluator.number(right)));
    }

    /** Reject non-finite numeric results. */
    private static finite(value: DynamicValue): DynamicValue {
        if (typeof value === 'number') return DynamicValueEvaluator.number(value);
        return value;
    }

    /** Convert booleans and numbers to conditions; strings are not conditions. */
    private static truthy(value: DynamicValue): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') throw new Error(`Cannot use string '${value}' as a condition.`);
        return value !== 0;
    }

    private constructor(expression: string, resolve?: (path: string) => unknown) {
        if (expression.length > DynamicValueEvaluator.MAX_LENGTH)
            throw new Error(`Expression exceeds ${DynamicValueEvaluator.MAX_LENGTH} characters.`);

        this.tokens = DynamicValueEvaluator.tokenize(expression);
        this.resolve = resolve;
        this.ast = this.parse();
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

    /* Parsing */

    private peek() {
        return this.tokens[this.pos];
    }

    private next() {
        return this.tokens[this.pos++];
    }

    private expect(token: string) {
        if (this.next() !== token) throw new Error(`Expected '${token}'.`);
    }

    private parse(): Node {
        this.pos = 0;
        const node = this.expression();
        // Allow one optional trailing semicolon.
        if (this.peek() === ';') this.next();
        if (this.pos < this.tokens.length) throw new Error(`Unexpected token '${this.peek()}'.`);
        return node;
    }

    /** Parse a binding or a regular expression. */
    private expression(): Node {
        const token = this.peek();
        return token?.startsWith('$') && this.tokens[this.pos + 1] === '=' ? this.binding() : this.ternary();
    }

    /** Parse `$name = value; body`. The initializer uses the outer lexical scope. */
    private binding(): Node {
        const name = this.next();
        this.expect('=');
        const value = this.ternary();
        this.expect(';');

        this.scope.add(name);
        try {
            return { kind: 'bind', name, value, body: this.expression() };
        } finally {
            this.scope.delete(name);
        }
    }

    /** Parse a right-associative ternary. */
    private ternary(): Node {
        const condition = this.binary();
        if (this.peek() !== '?') return condition;

        this.next();
        const whenTrue = this.ternary();
        this.expect(':');
        const whenFalse = this.ternary();

        return { kind: 'ternary', condition, whenTrue, whenFalse };
    }

    /** Parse left-associative binary operators by precedence. */
    private binary(level = 0): Node {
        const operators = DynamicValueEvaluator.PRECEDENCE[level];
        if (!operators) return this.unary();

        let node = this.binary(level + 1);
        while (operators.includes(this.peek())) {
            const op = this.next();
            // `in` requires a list on the right.
            if (op === 'in') {
                this.expect('[');
                node = { kind: 'in', value: node, list: this.list(']') };
            } else {
                node = { kind: 'binary', op, left: node, right: this.binary(level + 1) };
            }
        }

        return node;
    }

    /** Parse prefix operators. */
    private unary(): Node {
        const token = this.peek();
        if (token !== undefined && Object.hasOwn(DynamicValueEvaluator.UNARY, token)) {
            this.next();
            return { kind: 'unary', op: token, operand: this.unary() };
        }

        return this.exponent();
    }

    /** Parse right-associative exponentiation. */
    private exponent(): Node {
        const base = this.primary();
        if (this.peek() !== '**') return base;

        this.next();
        return { kind: 'binary', op: '**', left: base, right: this.unary() };
    }

    private primary(): Node {
        const token = this.next();
        if (token === undefined) throw new Error('Unexpected end of expression.');

        if (/^\d/.test(token)) return { kind: 'value', value: DynamicValueEvaluator.number(Number(token)) };
        if (token === 'true') return { kind: 'value', value: true };
        if (token === 'false') return { kind: 'value', value: false };
        if (token.startsWith('\'') || token.startsWith('"')) return { kind: 'value', value: token.slice(1, -1) };
        if (token.startsWith('@')) return { kind: 'ref', token, path: token.slice(1) };

        // Binding references must already be in scope.
        if (token.startsWith('$')) {
            if (this.scope.has(token)) return { kind: 'var', name: token };
            throw new Error(`Unbound name '${token}'.`);
        }

        if (token === '(') {
            const node = this.ternary();
            this.expect(')');
            return node;
        }

        if (token === '[') return this.lookup();

        if (token === '{') return this.objectLookup();

        // Exclude inherited names such as `constructor`.
        if (Object.hasOwn(DynamicValueEvaluator.FUNCTIONS, token)) {
            this.expect('(');
            return { kind: 'call', fn: token, args: this.list(')') };
        }

        if (Object.hasOwn(DynamicValueEvaluator.CONSTANTS, token))
            return { kind: 'value', value: DynamicValueEvaluator.CONSTANTS[token] };

        throw new Error(`Unknown token '${token}'.`);
    }

    /** Parse `[values][index]`. Arrays exist only as lookup tables. */
    private lookup(): Node {
        const values = this.list(']');
        this.expect('[');
        const index = this.ternary();
        this.expect(']');

        return { kind: 'lookup', values, index };
    }

    /** Parse `{key: value}[key]`. Objects exist only as lookup tables. */
    private objectLookup(): Node {
        const entries = this.entries();
        this.expect('[');
        const key = this.ternary();
        this.expect(']');

        return { kind: 'objectLookup', entries, key };
    }

    /** Parse comma-separated map entries. */
    private entries(): { key: string; value: Node }[] {
        const entries: { key: string; value: Node }[] = [];

        if (this.peek() !== '}') {
            do {
                const key = this.key();
                this.expect(':');
                entries.push({ key, value: this.ternary() });
            } while (this.peek() === ',' && this.next());
        }

        this.expect('}');
        return entries;
    }

    /** Parse a quoted string or bare identifier as a map key. */
    private key(): string {
        const token = this.next();
        if (token !== undefined && (token.startsWith('\'') || token.startsWith('"'))) return token.slice(1, -1);
        if (token !== undefined && /^[A-Za-z_]\w*$/.test(token)) return token;
        throw new Error(`Expected a string or identifier key, got '${token}'.`);
    }

    /** Parse a comma-separated expression list. */
    private list(closing: string): Node[] {
        const nodes: Node[] = [];

        if (this.peek() !== closing) {
            do {
                nodes.push(this.ternary());
            } while (this.peek() === ',' && this.next());
        }

        this.expect(closing);
        return nodes;
    }

    /* Evaluation */

    /** Evaluate a node in its lexical environment. */
    private run(node: Node = this.ast, env: Environment = new Map()): DynamicValue {
        switch (node.kind) {
            case 'value':
                return node.value;
            case 'ref':
                return this.resolveRef(node);
            case 'bind':
                return this.runBind(node, env);
            case 'var': {
                const thunk = env.get(node.name);
                if (!thunk) throw new Error(`Unbound name '${node.name}'.`);
                return thunk();
            }
            case 'unary':
                return DynamicValueEvaluator.UNARY[node.op](this.run(node.operand, env));
            case 'ternary':
                return DynamicValueEvaluator.truthy(this.run(node.condition, env))
                    ? this.run(node.whenTrue, env)
                    : this.run(node.whenFalse, env);
            case 'binary':
                return this.runBinary(node, env);
            case 'in': {
                const value = this.run(node.value, env);
                return node.list.some(item => this.run(item, env) === value);
            }
            case 'lookup':
                return this.runLookup(node, env);
            case 'objectLookup':
                return this.runObjectLookup(node, env);
            case 'call':
                return DynamicValueEvaluator.number(
                    DynamicValueEvaluator.FUNCTIONS[node.fn](
                        ...node.args.map(arg => DynamicValueEvaluator.number(this.run(arg, env))),
                    )
                );
        }
    }

    /** Evaluate a lazy, memoized lexical binding. */
    private runBind(node: Extract<Node, { kind: 'bind' }>, env: Environment): DynamicValue {
        let cached: { value: DynamicValue } | undefined;
        const bodyEnv = new Map(env);
        bodyEnv.set(node.name, () => (cached ??= { value: this.run(node.value, env) }).value);
        return this.run(node.body, bodyEnv);
    }

    /** Evaluate binary operators, including short-circuiting operators. */
    private runBinary(node: Extract<Node, { kind: 'binary' }>, env: Environment): DynamicValue {
        // Fall back when the left side cannot be evaluated.
        if (node.op === '??') {
            try {
                return this.run(node.left, env);
            } catch {
                return this.run(node.right, env);
            }
        }
        if (node.op === '&&')
            return DynamicValueEvaluator.truthy(this.run(node.left, env)) &&
                DynamicValueEvaluator.truthy(this.run(node.right, env));
        if (node.op === '||')
            return DynamicValueEvaluator.truthy(this.run(node.left, env)) ||
                DynamicValueEvaluator.truthy(this.run(node.right, env));

        return DynamicValueEvaluator.OPERATORS[node.op](this.run(node.left, env), this.run(node.right, env));
    }

    /** Evaluate an array lookup. */
    private runLookup(node: Extract<Node, { kind: 'lookup' }>, env: Environment): DynamicValue {
        const index = DynamicValueEvaluator.number(this.run(node.index, env));

        if (!Number.isInteger(index) || index < 0 || index >= node.values.length)
            throw new Error(`Index ${index} out of range.`);

        return this.run(node.values[index], env);
    }

    /** Evaluate a map lookup. */
    private runObjectLookup(node: Extract<Node, { kind: 'objectLookup' }>, env: Environment): DynamicValue {
        const key = this.run(node.key, env);
        if (typeof key !== 'string') throw new Error(`Expected a string key, got '${key}'.`);

        const entry = node.entries.find(entry => entry.key === key);
        if (!entry) throw new Error(`Key '${key}' not found.`);

        return this.run(entry.value, env);
    }

    /** Resolve an `@property` reference to a supported primitive. */
    private resolveRef(node: Extract<Node, { kind: 'ref' }>): DynamicValue {
        if (!this.resolve) throw new Error('No resolver for references.');

        const value = this.resolve(node.path);

        if (typeof value === 'number') return DynamicValueEvaluator.number(value);
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim();
        throw new Error(`Reference '${node.token}' did not resolve to a primitive.`);
    }
}
