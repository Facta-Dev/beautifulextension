// Beautiful Extension drop-in lints
//
// Paste this into your repo root (read the overrides below first, then add
// your project-specific ignores on the first entry). It makes eslint enforce
// the rules from the extension-best-practices skill that a linter can check:
// the layer walls, the no-remote-code rule, and the silencing requirements.
// Silence a rule locally with a reason, which the config requires.
//
// Everything beyond the pinned rules rides the typescript-eslint
// strictTypeChecked + stylisticTypeChecked presets. Make CI strict with:
//
//     npx eslint .
//
// The lints/check project proves every pinned rule fires: see
// scripts/check-lints.sh and tests/contracts/test_lints_contract.py.

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";

const PLATFORM_MESSAGE =
  "The domain and application layers never touch chrome.*; platform access goes through a port — see the 'Architecture contract' in extension-best-practices.";

const UI_SDK_MESSAGE =
  "The UI never imports the SDK: call the typed RPC and render its state — see the 'Architecture contract' in extension-best-practices.";

const CONTENT_MESSAGE =
  "A content script never imports the SDK, the session or tokens: it sends a typed content message and the worker decides — see the 'Architecture contract' in extension-best-practices.";

const SDK_MESSAGE =
  "The SDK is a plain TypeScript client: it never imports chrome or React — see the 'Architecture contract' in extension-best-practices.";

export default tseslint.config(
  { ignores: ["dist/", "node_modules/", "coverage/", "src/gen/", ".output/"] },
  js.configs.recommended,
  ...tseslint.configs.strictTypeChecked,
  ...tseslint.configs.stylisticTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    plugins: {
      "@eslint-community/eslint-comments": eslintComments,
    },
    rules: {
      // One logger, not console.* sprinkled through handlers.
      "no-console": "error",
      // No remote code: the CSP forbids it and the store rejects it.
      "no-eval": "error",
      "no-new-func": "error",
      "@typescript-eslint/no-implied-eval": "error",
      // A debug statement or a blocking alert in a worker is not a feature.
      "no-debugger": "error",
      "no-alert": "error",
      // Silencing must be narrow, explained, and rare: @ts-expect-error with a
      // reason on the narrowest line; ts-ignore and ts-nocheck are flat out.
      "@typescript-eslint/ban-ts-comment": [
        "error",
        {
          "ts-expect-error": "allow-with-description",
          "ts-ignore": true,
          "ts-nocheck": true,
          minimumDescriptionLength: 10,
        },
      ],
      "@typescript-eslint/no-floating-promises": "error",
      "@typescript-eslint/no-misused-promises": [
        "error",
        { checksConditionals: true, checksVoidReturn: true },
      ],
      "@typescript-eslint/switch-exhaustiveness-check": "error",
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
      "@typescript-eslint/explicit-module-boundary-types": "error",
      "@typescript-eslint/no-unnecessary-type-assertion": "error",
      // Muting attempts are themselves findings.
      "@eslint-community/eslint-comments/no-unlimited-disable": "error",
      "@eslint-community/eslint-comments/require-description": ["error", { ignore: [] }],
      // The platform is a port, not a global.
      "no-restricted-globals": [
        "error",
        { name: "chrome", message: PLATFORM_MESSAGE },
      ],
    },
  },
  {
    // The domain and application layers never touch chrome.*.
    files: ["src/domain/**/*.{ts,tsx}", "src/application/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-globals": [
        "error",
        { name: "chrome", message: PLATFORM_MESSAGE },
      ],
      "no-restricted-imports": ["error", { paths: [{ name: "chrome", message: PLATFORM_MESSAGE }] }],
    },
  },
  {
    // The UI talks to the worker, never to the SDK.
    files: ["src/ui/**/*.{ts,tsx}", "src/popup/**/*.{ts,tsx}", "src/options/**/*.{ts,tsx}", "src/sidepanel/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        { patterns: [{ group: ["@/sdk", "@/sdk/*", "**/sdk/*"], message: UI_SDK_MESSAGE }] },
      ],
    },
  },
  {
    // A content script never gets the SDK, the session or tokens.
    files: ["src/content/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            { group: ["@/sdk", "@/sdk/*", "**/sdk/*", "@/session", "@/session/*", "@/auth", "@/auth/*"], message: CONTENT_MESSAGE },
          ],
        },
      ],
    },
  },
  {
    // The SDK stays platform-free and React-free.
    files: ["src/sdk/**/*.{ts,tsx}"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            { name: "chrome", message: SDK_MESSAGE },
            { name: "react", message: SDK_MESSAGE },
          ],
          patterns: [{ group: ["@/session", "@/session/*"], message: SDK_MESSAGE }],
        },
      ],
    },
  },
);
