module.exports = {
    "root": true,
    "env": {
        "browser": true,
        "es2021": true
    },
    "extends": "standard-with-typescript",
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
        // "prettier",
        "@typescript-eslint",
        "@stylistic/ts",
        // "import",
    ],
    parser: '@typescript-eslint/parser',
    "rules": {
        // Warnings for things that could be better
        "@typescript-eslint/consistent-type-imports": "warn",
        "@typescript-eslint/explicit-function-return-type": "warn",
        "@typescript-eslint/strict-boolean-expressions": "warn",
        "@typescript-eslint/class-literal-property-style": "warn",
        "@typescript-eslint/ban-ts-comment": "warn",
        "@typescript-eslint/dot-notation": "warn",
        "@typescript-eslint/no-unused-vars": "warn",
        "prefer-const": "warn",
        "@typescript-eslint/no-confusing-void-expression": "warn",
        "@typescript-eslint/no-misused-promises": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-floating-promises": "warn",
        "no-case-declarations": "warn",
        "@typescript-eslint/promise-function-async": "warn",

        // These rules adjust minor spacing and formatting, but are clearly best practice and should be enabled soon
        "@typescript-eslint/comma-spacing": "off",
        "@typescript-eslint/consistent-type-definitions": "off",

        // These rules adjust minor spacing and formatting, and will probably just be a nuisance... probably best left off, at least for now
        "padded-blocks": "off",
        "eol-last": "off",
        "@typescript-eslint/space-infix-ops": "off",
        "@typescript-eslint/member-delimiter-style": "off",
        "object-curly-newline": "off",
        "object-property-newline": "off",
        "operator-linebreak": "off",
        "@typescript-eslint/lines-between-class-members": "off",
        "@typescript-eslint/indent": "off",
        "@typescript-eslint/semi": "off",
        "@typescript-eslint/quotes": "off",
        "@typescript-eslint/object-curly-spacing": "off",
        "@typescript-eslint/comma-dangle": "off",
        "quote-props": "off",
        "no-trailing-spaces": "off",
        "no-multiple-empty-lines": "off",
        "spaced-comment": "off",
        "no-multi-spaces": "off",
        "@typescript-eslint/key-spacing": "off",
        "block-spacing": "off",
        "@typescript-eslint/keyword-spacing": "off",
        "@typescript-eslint/naming-convention": "off",
        "@typescript-eslint/type-annotation-spacing": "off",

        // Keeping these off permanently
        "@typescript-eslint/space-before-function-paren": "off",
        "@typescript-eslint/no-namespace": "off",
        "@typescript-eslint/no-extraneous-class": "off",


        // Unsure on these, keeping them off but should probably be warn
        "@typescript-eslint/array-type": "off",
        "@typescript-eslint/prefer-nullish-coalescing": "off",
        "@typescript-eslint/restrict-template-expressions": "off",
    },
}
