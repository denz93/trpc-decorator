// @ts-check

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import unusedImports from "eslint-plugin-unused-imports";


export default tseslint.config(
  {
    extends: [  eslint.configs.recommended,
      ...tseslint.configs.recommended,],
    plugins: {
        "unused-imports": unusedImports,
    },
    rules: {
        "@typescript-eslint/ban-ts-comment": "off",
        "no-unused-vars": "off", // or "@typescript-eslint/no-unused-vars": "off",
        "@typescript-eslint/no-explicit-any": "off",
        "no-explicit-any": "off",
        "unused-imports/no-unused-imports": "error",
        "unused-imports/no-unused-vars": [
            "error",
            {
                "vars": "all",
                "varsIgnorePattern": "^_",
                "args": "after-used",
                "argsIgnorePattern": "^_",
            },
        ],
        "@typescript-eslint/no-unused-vars": "off"
    }
  }
);