import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

/** @type {import('eslint').Linter.Config[]} */
export default [
    { ignores: ["**/*.js", "**/*.mjs", "dist/**", "node_modules/**"] },
    pluginJs.configs.recommended,
    ...tseslint.configs.recommendedTypeChecked,
    ...tseslint.configs.stylisticTypeChecked,
    prettierConfig, // Must be last to override other formatting rules
    {
        files: ["**/*.ts"],
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module",
            globals: {
                ...globals.browser,
                ...globals.node,
                ...globals.es2021,
            },
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname,
            },
        },
        rules: {
            "@typescript-eslint/await-thenable": "warn",
            "@typescript-eslint/no-floating-promises": "warn",
            "@typescript-eslint/no-misused-promises": "warn",
            "@typescript-eslint/prefer-promise-reject-errors": "warn",
            "@typescript-eslint/promise-function-async": "warn",
            "@typescript-eslint/require-await": "warn",
            "@typescript-eslint/return-await": "off", // Often conflicts with valid logic
            "@typescript-eslint/consistent-type-assertions": "warn",
            "@typescript-eslint/no-explicit-any": "warn",
            "@typescript-eslint/no-invalid-void-type": "warn",
            "@typescript-eslint/no-unnecessary-type-assertion": "warn",
            "@typescript-eslint/non-nullable-type-assertion-style": "off",
            "@typescript-eslint/no-redundant-type-constituents": "warn",
            "@typescript-eslint/no-unsafe-function-type": "warn",
            "@typescript-eslint/no-wrapper-object-types": "warn",
            "@typescript-eslint/no-unsafe-member-access": "warn",
            "@typescript-eslint/no-unsafe-return": "warn",
            
            // Relaxed for Quench/Foundry contexts
            "@typescript-eslint/no-unsafe-argument": "warn",
            "@typescript-eslint/no-unsafe-assignment": "warn", 
            "@typescript-eslint/no-unsafe-call": "warn", 

            "eqeqeq": "warn",
            "no-case-declarations": "warn",
            "no-empty": "warn",
            "no-fallthrough": "warn",
            "no-mixed-operators": "warn",
            "no-prototype-builtins": "warn",
            "no-return-assign": "warn",
            "no-unneeded-ternary": "warn",
            "no-unreachable-loop": "error", // Likely a bug
            "no-useless-computed-key": "warn",
            "no-useless-escape": "warn",
            "no-useless-return": "warn",
            "prefer-const": "warn",
            "prefer-regex-literals": "warn",
            "@typescript-eslint/ban-ts-comment": "warn",
            "@typescript-eslint/class-literal-property-style": "warn",
            "@typescript-eslint/consistent-generic-constructors": "warn",
            "@typescript-eslint/consistent-indexed-object-style": "warn",
            "@typescript-eslint/method-signature-style": "warn",
            "@typescript-eslint/no-empty-interface": "warn",
            "@typescript-eslint/no-empty-object-type": "warn",
            "@typescript-eslint/no-inferrable-types": "warn",
            "@typescript-eslint/no-this-alias": "warn",
            "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
            "@typescript-eslint/no-unused-expressions": "warn",
            "@typescript-eslint/no-unused-vars": "warn",
            "@typescript-eslint/prefer-includes": "warn",
            "@typescript-eslint/prefer-optional-chain": "warn",
            "@typescript-eslint/prefer-readonly": "warn",
            "@typescript-eslint/prefer-reduce-type-parameter": "warn",
            "@typescript-eslint/require-array-sort-compare": "warn",
            "@typescript-eslint/unbound-method": "warn",

            // Handled by Prettier
            "@typescript-eslint/comma-spacing": "off",
            "@typescript-eslint/lines-between-class-members": "off",
            "new-cap": "off",
            "one-var": "off",
            "spaced-comment": "off",
            "@typescript-eslint/space-before-function-paren": "off",

            // Style Preferences / Off
            "@typescript-eslint/array-type": "off",
            "@typescript-eslint/consistent-type-definitions": "off",
            "@typescript-eslint/consistent-type-imports": "off",
            "@typescript-eslint/dot-notation": "off",
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/naming-convention": "off",
            "@typescript-eslint/no-confusing-non-null-assertion": "off",
            "@typescript-eslint/no-confusing-void-expression": "off",
            "@typescript-eslint/no-dynamic-delete": "warn",
            "@typescript-eslint/no-empty-function": "off",
            "@typescript-eslint/no-extraneous-class": "off",
            "@typescript-eslint/no-namespace": "off",
            "@typescript-eslint/no-non-null-assertion": "off",
            "@typescript-eslint/prefer-nullish-coalescing": "off",
            "@typescript-eslint/restrict-template-expressions": "off",
            "@typescript-eslint/triple-slash-reference": "off",

            // Incompatible with ESM (CJS only)
            "@typescript-eslint/no-var-requires": "warn",
        },
    }
];
