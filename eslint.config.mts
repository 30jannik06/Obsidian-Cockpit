import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import tsparser from "@typescript-eslint/parser";
import obsidianmd from "eslint-plugin-obsidianmd";
import prettier from "eslint-config-prettier";
import { defineConfig } from "eslint/config";

const obsidianGlobals = {
  activeWindow: "readonly",
  activeDocument: "readonly",
} as const;

export default defineConfig([
  { files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], plugins: { js }, extends: ["js/recommended"], languageOptions: { globals: { ...globals.browser, ...obsidianGlobals } } },
  tseslint.configs.recommended,
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tsparser,
      parserOptions: { project: "./tsconfig.json" },
    },
  },
  prettier,
]);
