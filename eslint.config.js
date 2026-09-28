import js from "@eslint/js";
import prettier from "eslint-config-prettier";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";
import tseslint from "typescript-eslint";

// `radix-ui` re-exports every primitive from its index, so importing from the
// package root drags all of them through Vite's dep pre-bundling. The
// per-component subpaths (`radix-ui/dialog`) are the same modules with their
// own types.
const radixBarrel = {
  name: "radix-ui",
  message:
    "Import the component subpath (radix-ui/<component>) — the barrel pulls in every primitive and slows dev startup.",
};

const lucideBarrel = {
  name: "lucide-react",
  message:
    "Import the icon directly (lucide-react/dist/esm/icons/<name>) — the barrel pulls in every icon and slows dev startup.",
};

// Enforced everywhere, vendored shadcn/ui files included: `shadcn add` output
// needs its `radix-ui` and `lucide-react` imports rewritten before it will lint.
const noBarrels = { paths: [radixBarrel, lucideBarrel] };

export default tseslint.config(
  {
    // `test-results` and `playwright-report` are Playwright's own output —
    // gitignored, and the report bundles a minified trace viewer that fails a
    // thousand rules.
    ignores: [
      "dist",
      "coverage",
      "test-results",
      "playwright-report",
      "src/routeTree.gen.ts",
    ],
  },
  js.configs.recommended,
  {
    files: ["**/*.{ts,tsx}"],
    // Type-checked rules are scoped to TS: applying them globally makes ESLint
    // fail on its own config file, which has no tsconfig project.
    extends: [tseslint.configs.recommendedTypeChecked],
    languageOptions: {
      ecmaVersion: 2023,
      globals: globals.browser,
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports", fixStyle: "separate-type-imports" },
      ],
      eqeqeq: ["error", "always"],
      "no-restricted-imports": ["error", noBarrels],
      "no-restricted-syntax": [
        "error",
        {
          selector: "MemberExpression[object.name=React][property.name=/^use/]",
          message:
            'Use hooks without the "React" prefix, so one import style is used. Example: "useEffect" instead of "React.useEffect".',
        },
      ],
    },
  },
  {
    files: ["**/*.tsx"],
    extends: [
      reactHooks.configs.flat["recommended-latest"],
      reactRefresh.configs.vite,
    ],
  },
  {
    // TanStack Router file-based routes export a `Route` object alongside their
    // component, and guards redirect by `throw redirect(...)` — both are the
    // framework's documented idiom, not mistakes.
    files: ["src/routes/**"],
    rules: {
      "react-refresh/only-export-components": "off",
      "@typescript-eslint/only-throw-error": "off",
    },
  },
  {
    // Vendored shadcn/ui components: kept close to upstream so `shadcn add`
    // upgrades stay a readable diff — except for imports (see noBarrels).
    files: ["src/components/ui/**"],
    rules: {
      "react-refresh/only-export-components": "off",
      "no-restricted-syntax": "off",
    },
  },
  {
    // Application entry point: it renders, it does not export.
    files: ["src/main.tsx"],
    rules: {
      "react-refresh/only-export-components": "off",
    },
  },
  {
    files: ["src/**/*.test.{ts,tsx}", "src/test/**"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    // Playwright specs run in Node and drive a browser, so they need both sets
    // of globals.
    files: ["e2e/**/*.ts"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.node },
    },
  },
  {
    files: ["vite.config.ts", "vitest.config.ts", "playwright.config.ts"],
    languageOptions: {
      globals: globals.node,
    },
  },
  prettier,
);
