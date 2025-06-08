module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": ["standard-with-typescript", "prettier"],
    ignorePatterns: ["**/*.js", "**/*.mjs"],
    "overrides": [
        {
            "env": {
                "node": true,
                "es6": true,
                "browser": true,
            },
            "files": [
                ".eslintrc.{js,cjs}",
                "**/*.ts",
            ],
            "parserOptions": {
                "sourceType": "script"
            }
        }
    ],
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module"
    },
    "plugins": [
        "prettier",
        "@typescript-eslint",
    ],
    parser: '@typescript-eslint/parser',
    "rules": {
        "prettier/prettier": ["off"],

        // TODO: ESLint Roadmap Step 2 - Set these rules to "error"
        "@typescript-eslint/no-invalid-void-type": "off", // This prohibits return console.asd in one line after an if statement. This might not be generally liked, though improves readability.
        "no-unreachable-loop": "error",
        "no-return-assign": "off",
        "@typescript-eslint/consistent-type-assertions": "off", // Sometimes this makes life so much easier when returning types.

        // Warnings for things that could be better
        "@typescript-eslint/explicit-function-return-type": "off", // Implicit type returns aren't a bad thing
        "@typescript-eslint/strict-boolean-expressions": "off", // I might turn this off.  Javascript's fluid truthiness logic is just too nice
        "@typescript-eslint/class-literal-property-style": "off", // SuccessTest implementation heavily uses this and I don't see the value of refactoring it, yet.
        "@typescript-eslint/ban-ts-comment": "warn", // With Foundry v13, this got a bit annoying: TODO: foundry-vtt-types v9
        "@typescript-eslint/no-unused-vars": "error",
        "prefer-const": "error",
        "@typescript-eslint/no-confusing-void-expression": "off", // I do like my if () return console.error() and similar statements...
        "@typescript-eslint/no-misused-promises": "off", // With Foundry v13 and $(html) this caused issues on async callbacks
        "@typescript-eslint/prefer-optional-chain": "error",
        "@typescript-eslint/no-floating-promises": "off", // Allow executing async functions in a sync method, if async isn't needed.
        "no-case-declarations": "off", // We use this in switch / case and it does improve readability
        "@typescript-eslint/promise-function-async": "warn", // With Foundry v13 this caused a few issues, so I set it to warn for now.
        "@typescript-eslint/no-empty-interface": "error",
        "@typescript-eslint/consistent-indexed-object-style": "error",
        "@typescript-eslint/ban-types": "error", //Maybe this should be error?
        "no-prototype-builtins": "off", // While this rule makes sense for public facing applications, it's not a concern for an app like ours and I'd rather have better readability.
        "@typescript-eslint/unbound-method": "error",
        "no-useless-return": "off", // A explicit return statement is never unnecessary, it may prevent bugs for future code changes.
        "@typescript-eslint/return-await": "error",
        "@typescript-eslint/prefer-includes": "error",
        "no-unneeded-ternary": "error",
        "@typescript-eslint/no-unnecessary-type-assertion": "error",
        "no-fallthrough": "error",
        "eqeqeq": "error",
        "@typescript-eslint/prefer-readonly": "error",
        "@typescript-eslint/await-thenable": "error",
        "@typescript-eslint/no-dynamic-delete": "off", // We do this often, I while I see the harm, I view the risk as acceptable.
        "@typescript-eslint/no-this-alias": "error",
        "no-useless-computed-key": "error",
        "no-mixed-operators": "error",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "error",
        "no-useless-escape": "error",
        "@typescript-eslint/method-signature-style": "error",
        "prefer-promise-reject-errors": "error",
        "@typescript-eslint/no-var-requires": "error",
        "one-var": "error",
        "import/no-duplicates": "error",
        "no-empty": "error",
        "@typescript-eslint/no-unused-expressions": "warn", 
        "@typescript-eslint/consistent-generic-constructors": "error",
        "prefer-regex-literals": "error",
        "@typescript-eslint/prefer-reduce-type-parameter": "error",
        "@typescript-eslint/require-array-sort-compare": "error",

        // These rules adjust minor spacing and formatting, but are clearly best practice and should be enabled soon
        "@typescript-eslint/comma-spacing": "off",
        "@typescript-eslint/consistent-type-definitions": "off",
        "@typescript-eslint/naming-convention": "off",

        // Some formatting rules that I'm keeping off for now
        "spaced-comment": "off",
        "new-cap": "off",
        "@typescript-eslint/lines-between-class-members": "off",

        // Commented out formatting rules - these have all been superseded by adding Prettier
        // "padded-blocks": "off",
        // "eol-last": "off",
        // "@typescript-eslint/space-infix-ops": "off",
        // "@typescript-eslint/member-delimiter-style": "off",
        // "object-curly-newline": "off",
        // "object-property-newline": "off",
        // "operator-linebreak": "off",
        // "@typescript-eslint/indent": "off",
        // "@typescript-eslint/semi": "off",
        // "@typescript-eslint/quotes": "off",
        // "@typescript-eslint/object-curly-spacing": "off",
        // "@typescript-eslint/comma-dangle": "off",
        // "quote-props": "off",
        // "no-trailing-spaces": "off",
        // "no-multiple-empty-lines": "off",
        // "no-multi-spaces": "off",
        // "@typescript-eslint/key-spacing": "off",
        // "block-spacing": "off",
        // "@typescript-eslint/keyword-spacing": "off",
        // "@typescript-eslint/type-annotation-spacing": "off",
        // "curly": "off",
        // "@typescript-eslint/block-spacing": "off",
        // "@typescript-eslint/space-before-blocks": "off",
        // "multiline-ternary": "off",
        // "space-in-parens": "off",
        // "@typescript-eslint/brace-style": "off",
        // "semi-spacing": "off",
        // "no-tabs": "off",
        // "no-whitespace-before-property": "off",

        // These probably need to stay off permanently
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-extraneous-class": "off",
        "@typescript-eslint/triple-slash-reference": "off",
        "@typescript-eslint/no-non-null-assertion": "off",

        // Unsure on these, keeping them off but should probably be warn
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
        "@typescript-eslint/consistent-type-imports": "off",
        "@typescript-eslint/dot-notation": "off",
    },
}
