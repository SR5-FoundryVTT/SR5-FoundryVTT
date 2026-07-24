/** The result of evaluating a dynamic change value. */
export type DynamicValue = number | boolean | string;

/**
 * A node in the parsed expression tree. Parsing builds this tree, then run() walks it, so
 * evaluation is separate from parsing - which lets ternaries and && / || short-circuit.
 */
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

/**
 * Evaluate the small expression language used by dynamic Active Effect change values. It supports:
 *
 * - Literals: numbers, `true`/`false`, quoted strings, and `@property` references.
 * - Arithmetic: `+ - * / %` and `**` (right-associative), plus unary `+ - !` and parentheses.
 * - Comparisons: `< <= > >= == != === !==`, yielding booleans.
 * - Logic: `&&`, `||`, and the fallback `??` (yields the right operand when the left can't evaluate).
 * - Membership: `'x in [a, b]'`.
 * - Ternaries: `'cond ? a : b'`.
 * - Array lookups: `'[100, 200, 300][2]'`.
 * - Map lookups: string-keyed tables like `{physical: 10, 'exotic-melee': 5}[type]` (bare or quoted keys).
 * - Bindings: `'$x = …; …'` names a value for reuse; a binding is evaluated at most once, only if reached.
 * - A fixed set of Math functions (`floor`, `sqrt`, `max`, …) and constants (`PI`, `E`, …).
 *
 * Evaluation is total: anything that isn't a valid expression comes back verbatim as a string, so
 * a plain value like 'physical' is unchanged. Ternaries, `&&` / `||` and `??` short-circuit, so a
 * guard like `'@r >= 1 ? [a,b][@r-1] : 0'` never evaluates the branch it doesn't take.
 *
 * `@property` references resolve through an optional resolver passed to evaluate, keeping string
 * and boolean types intact (Roll.replaceFormulaData substitutes strings unquoted and coerces
 * booleans to `1`/`0`). Without a resolver a reference is an unknown token, so the input falls
 * through verbatim.
 *
 * This exists because change values are attacker-controlled (players author effects, the Chummer
 * importer writes imported XML into them, modules ship effects), so Roll.safeEval - which runs its
 * argument as un-sandboxed JavaScript - allowed arbitrary code execution. Foundry's Roll parser is no
 * alternative either: it reserves square brackets for flavor text and has no array indexing, which
 * the lookup tables need.
 */
export class DynamicValueEvaluator {
    /**
     * Functions callable from an expression. Any other identifier is an unknown token. Membership
     * is tested with Object.hasOwn so inherited names like 'constructor' or 'toString' don't match.
     */
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

    /**
     * Named numeric constants usable as bare identifiers. Held apart from FUNCTIONS because these
     * are values, not callables: an expression uses 'PI', not 'PI()'. Membership is tested with
     * Object.hasOwn so inherited names don't match.
     */
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

    /**
     * Binary operators. Ordering and arithmetic go through numeric() to assert their operands;
     * equality compares without coercion so 'true == true' holds. Comparisons yield booleans.
     * ??, && and || are not here - they short-circuit in run() rather than taking both operands.
     */
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

    /** Prefix operators. '-'/'+' require a number, '!' takes any condition. */
    private static readonly UNARY: Record<string, (value: DynamicValue) => DynamicValue> = {
        '-': value => -DynamicValueEvaluator.number(value),
        '+': value => DynamicValueEvaluator.number(value),
        '!': value => !DynamicValueEvaluator.truthy(value),
    };

    /**
     * Binary operators grouped into precedence levels, loosest binding first. 'in' (membership,
     * right operand is a bracketed list) binds like a comparison. Exponentiation binds tighter and
     * is right-associative, so exponent() parses it rather than this table.
     */
    private static readonly PRECEDENCE = [
        ['??'],
        ['||'],
        ['&&'],
        ['<', '<=', '>', '>=', '==', '===', '!=', '!==', 'in'],
        ['+', '-'],
        ['*', '/', '%'],
    ];

    /** Bounds parse cost, as evaluation runs per change, per effect, on every data preparation. */
    private static readonly MAX_LENGTH = 1024;

    /**
     * Matches a single token, skipping leading whitespace. Order matters: string literals first,
     * references before numbers, and multi-character operators before the single-character class
     * so '!=' and '!==' win over '!'. Anything this can't match - backticks, dice notation, a bare
     * '.' - fails the parse, so evaluate returns the input verbatim as a string.
     */
    private static readonly TOKEN =
        /\s*('[^']*'|"[^"]*"|@\{[-.\w]+\}|@[-.\w]+|\$[A-Za-z_]\w*|\d+(?:\.\d+)?|<=|>=|===|!==|==|!=|&&|\|\||\?\?|\*\*|[-+*/%(){}[\],?:<>!=;]|[A-Za-z_]\w*)/y;

    private readonly tokens: string[];
    private readonly resolve?: (path: string) => unknown;
    private pos = 0;

    /** `$name`s bound by an enclosing binding, so primary() tells a bound name from an unknown one. */
    private readonly scope = new Set<string>();

    /** Bound `$name`s to their memoizing thunks during evaluation, mirroring the lexical scope. */
    private readonly env = new Map<string, () => DynamicValue>();

    /**
     * Evaluate an expression down to a single value.
     *
     * @param expression The expression to evaluate.
     * @param resolve Optional resolver mapping an `@property` path (without the leading @) to its
     *                value. Omit it and references become unknown tokens.
     * @returns The result, or the input verbatim when it isn't a valid expression.
     */
    static evaluate(expression: string, resolve?: (path: string) => unknown): DynamicValue {
        try {
            const evaluator = new DynamicValueEvaluator(expression, resolve);
            return evaluator.run(evaluator.parse());
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

    /** Wrap a binary operation that requires two numeric operands. */
    private static numeric(op: (a: number, b: number) => DynamicValue) {
        return (left: DynamicValue, right: DynamicValue): DynamicValue =>
            op(DynamicValueEvaluator.number(left), DynamicValueEvaluator.number(right));
    }

    /**
     * Coerce a value used as a condition. A number is truthy when non-zero, which is how
     * Roll.replaceFormulaData delivers boolean @refs (as 1 or 0). A string has no truth value
     * here, so using one as a condition throws rather than being treated as truthy.
     */
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

    /* -------------------------------------------- */
    /*  Parsing - token stream to Node tree         */
    /* -------------------------------------------- */

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
        // A single trailing ';' is tolerated, so a habitual terminator doesn't sink the expression.
        if (this.peek() === ';') this.next();
        if (this.pos < this.tokens.length) throw new Error(`Unexpected token '${this.peek()}'.`);
        return node;
    }

    /** A `$name = value; …` binding, or - without the '$name =' prefix - a plain expression. */
    private expression(): Node {
        const token = this.peek();
        return token?.startsWith('$') && this.tokens[this.pos + 1] === '=' ? this.binding() : this.ternary();
    }

    /**
     * '$name = value; body' - names a value for reuse within body. The value is parsed in the outer
     * scope (so '$x = $x' is unknown, no self-reference); the body sees the name, and being an
     * expression itself can chain further bindings. The '$' sigil gives names their own space, so a
     * name can never reach a function or constant - '$floor' and 'floor' are simply different names.
     */
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

    /** cond ? a : b, right associative. Branches may be any type and needn't match. */
    private ternary(): Node {
        const condition = this.binary();
        if (this.peek() !== '?') return condition;

        this.next();
        const whenTrue = this.ternary();
        this.expect(':');
        const whenFalse = this.ternary();

        return { kind: 'ternary', condition, whenTrue, whenFalse };
    }

    /** Left associative binary operators, one PRECEDENCE level per recursion. */
    private binary(level = 0): Node {
        const operators = DynamicValueEvaluator.PRECEDENCE[level];
        if (!operators) return this.unary();

        let node = this.binary(level + 1);
        while (operators.includes(this.peek())) {
            const op = this.next();
            // 'in' takes a bracketed list on the right instead of another operand.
            if (op === 'in') {
                this.expect('[');
                node = { kind: 'in', value: node, list: this.list(']') };
            } else {
                node = { kind: 'binary', op, left: node, right: this.binary(level + 1) };
            }
        }

        return node;
    }

    /** Prefix operators, binding looser than exponentiation. */
    private unary(): Node {
        const token = this.peek();
        if (token !== undefined && Object.hasOwn(DynamicValueEvaluator.UNARY, token)) {
            this.next();
            return { kind: 'unary', op: token, operand: this.unary() };
        }

        return this.exponent();
    }

    /**
     * Exponentiation, binding tighter than the binary and unary operators and right-associative.
     * The base is a primary; the exponent parses unary, so a signed or chained exponent nests.
     */
    private exponent(): Node {
        const base = this.primary();
        if (this.peek() !== '**') return base;

        this.next();
        return { kind: 'binary', op: '**', left: base, right: this.unary() };
    }

    private primary(): Node {
        const token = this.next();
        if (token === undefined) throw new Error('Unexpected end of expression.');

        if (/^\d/.test(token)) return { kind: 'value', value: Number(token) };
        if (token === 'true') return { kind: 'value', value: true };
        if (token === 'false') return { kind: 'value', value: false };
        if (token.startsWith('\'') || token.startsWith('"')) return { kind: 'value', value: token.slice(1, -1) };
        if (token.startsWith('@')) return { kind: 'ref', token, path: token.replace(/^@\{?|\}$/g, '') };

        // A '$name' is a binding reference; unknown here unless an enclosing binding put it in scope.
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

        // Object.hasOwn so inherited members ('constructor', 'toString', ...) aren't callable.
        if (Object.hasOwn(DynamicValueEvaluator.FUNCTIONS, token)) {
            this.expect('(');
            return { kind: 'call', fn: token, args: this.list(')') };
        }

        if (Object.hasOwn(DynamicValueEvaluator.CONSTANTS, token))
            return { kind: 'value', value: DynamicValueEvaluator.CONSTANTS[token] };

        throw new Error(`Unknown token '${token}'.`);
    }

    /**
     * '[a, b, c][index]' - an array literal is only ever a lookup table, so it must be indexed
     * immediately and can never escape as a value of its own.
     */
    private lookup(): Node {
        const values = this.list(']');
        this.expect('[');
        const index = this.ternary();
        this.expect(']');

        return { kind: 'lookup', values, index };
    }

    /**
     * "{a: x, 'b-c': y}[key]" - like a lookup but keyed by a string. As with an array literal, the
     * object is only ever a lookup table, so it must be indexed immediately and can never escape as
     * a value of its own.
     */
    private objectLookup(): Node {
        const entries = this.entries();
        this.expect('[');
        const key = this.ternary();
        this.expect(']');

        return { kind: 'objectLookup', entries, key };
    }

    /** Parse a comma separated list of 'key: expression' entries up to and including the '}'. */
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

    /**
     * A map key: a quoted string (any characters) or a bare identifier for the common case. Key
     * position is its own context, so a bare word here is a key, never a function/constant. Numbers
     * aren't keys - array lookup covers numeric indexing.
     */
    private key(): string {
        const token = this.next();
        if (token !== undefined && (token.startsWith('\'') || token.startsWith('"'))) return token.slice(1, -1);
        if (token !== undefined && /^[A-Za-z_]\w*$/.test(token)) return token;
        throw new Error(`Expected a string or identifier key, got '${token}'.`);
    }

    /** Parse a comma separated list of expressions up to and including the closing token. */
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

    /* -------------------------------------------- */
    /*  Evaluation - Node tree to value             */
    /* -------------------------------------------- */

    private run(node: Node): DynamicValue {
        switch (node.kind) {
            case 'value':
                return node.value;
            case 'ref':
                return this.resolveRef(node);
            case 'bind':
                return this.runBind(node);
            case 'var': {
                const thunk = this.env.get(node.name);
                if (!thunk) throw new Error(`Unbound name '${node.name}'.`);
                return thunk();
            }
            case 'unary':
                return DynamicValueEvaluator.UNARY[node.op](this.run(node.operand));
            case 'ternary':
                return DynamicValueEvaluator.truthy(this.run(node.condition))
                    ? this.run(node.whenTrue)
                    : this.run(node.whenFalse);
            case 'binary':
                return this.runBinary(node);
            case 'in': {
                const value = this.run(node.value);
                return node.list.some(item => this.run(item) === value);
            }
            case 'lookup':
                return this.runLookup(node);
            case 'objectLookup':
                return this.runObjectLookup(node);
            case 'call':
                return DynamicValueEvaluator.FUNCTIONS[node.fn](
                    ...node.args.map(arg => DynamicValueEvaluator.number(this.run(arg))),
                );
        }
    }

    /**
     * Bind the name to a thunk over its value, run the body, then restore the outer binding (if any)
     * so a rebinding of the same name in a nested scope is undone on the way out. The thunk memoizes,
     * so a value reused across the body is computed once; a value the body never reaches is never
     * computed, which keeps the short-circuit guarantee - an unreached binding can't sink the expression.
     */
    private runBind(node: Extract<Node, { kind: 'bind' }>): DynamicValue {
        let cached: { value: DynamicValue } | undefined;
        const previous = this.env.get(node.name);
        this.env.set(node.name, () => (cached ??= { value: this.run(node.value) }).value);

        try {
            return this.run(node.body);
        } finally {
            if (previous) this.env.set(node.name, previous);
            else this.env.delete(node.name);
        }
    }

    /** ??, && and || short-circuit here; every other operator takes both operands from OPERATORS. */
    private runBinary(node: Extract<Node, { kind: 'binary' }>): DynamicValue {
        // ?? falls back to the right operand when the left can't be evaluated (e.g. a missing ref).
        if (node.op === '??') {
            try {
                return this.run(node.left);
            } catch {
                return this.run(node.right);
            }
        }
        if (node.op === '&&')
            return DynamicValueEvaluator.truthy(this.run(node.left)) && DynamicValueEvaluator.truthy(this.run(node.right));
        if (node.op === '||')
            return DynamicValueEvaluator.truthy(this.run(node.left)) || DynamicValueEvaluator.truthy(this.run(node.right));

        return DynamicValueEvaluator.OPERATORS[node.op](this.run(node.left), this.run(node.right));
    }

    /** Evaluate only the indexed element, after bounds-checking the resolved index. */
    private runLookup(node: Extract<Node, { kind: 'lookup' }>): DynamicValue {
        const index = DynamicValueEvaluator.number(this.run(node.index));

        if (!Number.isInteger(index) || index < 0 || index >= node.values.length)
            throw new Error(`Index ${index} out of range.`);

        return this.run(node.values[index]);
    }

    /** Evaluate only the matched entry, after resolving the key to a string. */
    private runObjectLookup(node: Extract<Node, { kind: 'objectLookup' }>): DynamicValue {
        const key = this.run(node.key);
        if (typeof key !== 'string') throw new Error(`Expected a string key, got '${key}'.`);

        const entry = node.entries.find(entry => entry.key === key);
        if (!entry) throw new Error(`Key '${key}' not found.`);

        return this.run(entry.value);
    }

    /**
     * Resolve an `@property` reference to a typed value. Only primitives are usable in an
     * expression; a missing reference or a non-primitive throws, so evaluate falls through to
     * returning the input verbatim and the change is dropped.
     */
    private resolveRef(node: Extract<Node, { kind: 'ref' }>): DynamicValue {
        if (!this.resolve) throw new Error('No resolver for references.');

        const value = this.resolve(node.path);

        if (typeof value === 'number') return value;
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') return value.trim();
        throw new Error(`Reference '${node.token}' did not resolve to a primitive.`);
    }
}
