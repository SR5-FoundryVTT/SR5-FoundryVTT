// eslint.config.mjs
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettierConfig from "eslint-config-prettier";

// Note: 'standard-with-typescript' is deprecated for Flat Config.
// We use tseslint.configs.recommendedTypeChecked as the modern base.

export default tseslint.config(
  // 1. Global Ignores
  {
    ignores: ["**/*.js", "**/*.mjs", "dist/**", "node_modules/**"],
  },

  // 2. Base Configurations (JS, TS, and Prettier disabling)
  pluginJs.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  ...tseslint.configs.stylisticTypeChecked, // Adds stylistic rules previously found in 'standard'
  prettierConfig,

  // 3. Main Configuration Block
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
        // 'projectService' is the new, faster way to handle type-checking in v8
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    // Plugins are now inferred from rules or imported explicitly, 
    // but 'typescript-eslint' handles the parser automatically here.
    rules: {
      // --- Formatting / Prettier ---
      // Prettier config handles disabling conflicting rules automatically via the import above.

      // --- Deprecation (Plugin currently incompatible with ESLint 9) ---
      // "deprecation/deprecation": "warn", 

      // --- Type Safety ---
      "@typescript-eslint/no-unsafe-argument": "warn",
      "@typescript-eslint/no-invalid-void-type": "warn",
      "@typescript-eslint/consistent-type-assertions": "warn",
      "@typescript-eslint/no-confusing-void-expression": "off",
      "@typescript-eslint/no-misused-promises": "warn",
      "@typescript-eslint/prefer-optional-chain": "warn",
      "@typescript-eslint/no-floating-promises": "warn",
      "@typescript-eslint/promise-function-async": "warn",
      "@typescript-eslint/consistent-indexed-object-style": "warn",
      "@typescript-eslint/unbound-method": "warn",
      "@typescript-eslint/return-await": "off",
      "@typescript-eslint/prefer-includes": "warn",
      "@typescript-eslint/no-unnecessary-type-assertion": "warn",
      "@typescript-eslint/prefer-readonly": "warn",
      "@typescript-eslint/await-thenable": "warn",
      "@typescript-eslint/no-dynamic-delete": "warn",
      "@typescript-eslint/no-unnecessary-boolean-literal-compare": "warn",
      "@typescript-eslint/method-signature-style": "warn",
      "@typescript-eslint/prefer-reduce-type-parameter": "warn",
      "@typescript-eslint/require-array-sort-compare": "warn",

      // --- Breaking Changes in TSLint v8 (Rules Renamed) ---
      // @typescript-eslint/ban-types was removed. Replaced by these two:
      "@typescript-eslint/no-unsafe-function-type": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",

      // --- General JavaScript/Logic ---
      "no-unreachable-loop": "warn",
      "no-return-assign": "warn",
      "prefer-const": "warn",
      "no-case-declarations": "warn",
      "no-prototype-builtins": "warn",
      "no-useless-return": "warn",
      "no-unneeded-ternary": "warn",
      "no-fallthrough": "warn",
      "eqeqeq": "warn",
      "no-mixed-operators": "warn",
      "no-useless-escape": "warn",
      "prefer-promise-reject-errors": "warn",
      "one-var": "off",
      "no-empty": "warn",
      "prefer-regex-literals": "warn",
      "no-useless-computed-key": "warn",
      
      // Note: 'import/no-duplicates' requires eslint-plugin-import-x for Flat Config support. 
      // If you haven't installed that plugin, remove this line:
      // "import/no-duplicates": "warn", 

      // --- TypeScript (General) ---
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/class-literal-property-style": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-empty-interface": "warn",
      "@typescript-eslint/no-this-alias": "warn",
      "@typescript-eslint/no-var-requires": "warn", // Note: incompatible with ESM, usually only for CJS
      "@typescript-eslint/no-unused-expressions": "warn",
      "@typescript-eslint/consistent-generic-constructors": "warn",

      // --- Style / Disabled Formatting Rules ---
      "@typescript-eslint/comma-spacing": "off",
      "@typescript-eslint/consistent-type-definitions": "off",
      "@typescript-eslint/naming-convention": "off",
      "spaced-comment": "off",
      "new-cap": "off",
      "@typescript-eslint/lines-between-class-members": "off",

      // --- Permanently Off ---
      "@typescript-eslint/space-before-function-paren": "off",
      "@typescript-eslint/no-namespace": "off",
      "@typescript-eslint/no-extraneous-class": "off",
      "@typescript-eslint/triple-slash-reference": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
      "@typescript-eslint/array-type": "off",
      "@typescript-eslint/prefer-nullish-coalescing": "off",
      "@typescript-eslint/restrict-template-expressions": "off",
      "@typescript-eslint/consistent-type-imports": "off",
      "@typescript-eslint/dot-notation": "off",
    },
  }
);
