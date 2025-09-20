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
        "deprecation",
        "@typescript-eslint",
    ],
    parser: '@typescript-eslint/parser',
    "rules": {
        "prettier/prettier": ["off"],
        "deprecation/deprecation": "warn",

        // TODO: ESLint Roadmap Step 2 - Set these rules to "error"
        "@typescript-eslint/no-invalid-void-type": "warn",
        "no-unreachable-loop": "warn",
        "no-return-assign": "warn",
        "@typescript-eslint/consistent-type-assertions": "warn",

        // Warnings for things that could be better
        "@typescript-eslint/explicit-function-return-type": "off",
        "@typescript-eslint/strict-boolean-expressions": "off", // I might turn this off.  Javascript's fluid truthiness logic is just too nice
        "@typescript-eslint/class-literal-property-style": "warn",
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "prefer-const": "warn",
        "@typescript-eslint/no-confusing-void-expression": "off",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "no-case-declarations": "warn",
        "@typescript-eslint/promise-function-async": "warn",
        "@typescript-eslint/no-empty-interface": "warn",
        "@typescript-eslint/consistent-indexed-object-style": "warn",
        "@typescript-eslint/ban-types": "warn", //Maybe this should be error?
        "no-prototype-builtins": "warn",
        "@typescript-eslint/unbound-method": "warn",
        "no-useless-return": "warn",
        "@typescript-eslint/return-await": "off",
        "@typescript-eslint/prefer-includes": "warn",
        "no-unneeded-ternary": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "no-fallthrough": "warn",
        "eqeqeq": "warn",
        "@typescript-eslint/prefer-readonly": "warn",
        "@typescript-eslint/await-thenable": "warn",
        "@typescript-eslint/no-dynamic-delete": "warn",
        "@typescript-eslint/no-this-alias": "warn",
        "no-useless-computed-key": "warn",
        "no-mixed-operators": "warn",
        "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
        "no-useless-escape": "warn",
        "@typescript-eslint/method-signature-style": "warn",
        "prefer-promise-reject-errors": "warn",
        "@typescript-eslint/no-var-requires": "warn",
        "one-var": "warn",
        "import/no-duplicates": "warn",
        "no-empty": "warn",
        "@typescript-eslint/no-unused-expressions": "warn",
        "@typescript-eslint/consistent-generic-constructors": "warn",
        "prefer-regex-literals": "warn",
        "@typescript-eslint/prefer-reduce-type-parameter": "warn",
        "@typescript-eslint/require-array-sort-compare": "warn",

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
