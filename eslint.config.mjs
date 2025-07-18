import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Base Next.js and TypeScript configurations
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Global configuration for all files
  {
    rules: {
      // Code Quality Rules
      "no-unused-vars": "error",
      "no-console": "warn", // Allow console in development but warn
      "prefer-const": "error",
      "no-var": "error",
      "eqeqeq": ["error", "always"],
      "curly": ["error", "multi-line"],
      "no-duplicate-imports": "error",

      // TypeScript Rules
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["error", {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }],
      "@typescript-eslint/prefer-optional-chain": "error",
      "@typescript-eslint/prefer-nullish-coalescing": "error",
      "@typescript-eslint/no-non-null-assertion": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",

      // React Rules
      "react/prop-types": "off", // Using TypeScript for type checking
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/jsx-uses-react": "off",
      "react/jsx-uses-vars": "error",
      "react/no-unescaped-entities": "off",
      "react/display-name": "off",
      "react/jsx-key": ["error", {
        "checkFragmentShorthand": true
      }],
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-danger": "warn",
      "react/no-deprecated": "error",
      "react/no-direct-mutation-state": "error",
      "react/no-unknown-property": "error",
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "warn",

      // Next.js Specific Rules
      "@next/next/no-img-element": "error",
      "@next/next/no-page-custom-font": "error",
      "@next/next/no-unwanted-polyfillio": "error",
    },
  },

  // Configuration for API routes
  {
    files: ["**/api/**/*.{js,ts}", "**/app/api/**/*.{js,ts}"],
    rules: {
      "no-console": "off", // Allow console in API routes for logging
    },
  },

  // Configuration for test files
  {
    files: [
      "**/*.test.{js,jsx,ts,tsx}",
      "**/*.spec.{js,jsx,ts,tsx}",
      "**/__tests__/**/*.{js,jsx,ts,tsx}",
      "**/tests/**/*.{js,jsx,ts,tsx}",
    ],
    rules: {
      "no-console": "off", // Allow console in tests
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-non-null-assertion": "off",
    },
  },

  // Configuration for configuration files
  {
    files: [
      "*.config.{js,ts,mjs}",
      "**/*.config.{js,ts,mjs}",
      "tailwind.config.js",
      "next.config.js",
      "vitest.config.ts",
    ],
    rules: {
      "no-console": "off",
      "@typescript-eslint/no-var-requires": "off",
    },
  },

  // Healthcare/HIPAA specific rules for our project
  {
    files: ["**/src/**/*.{js,jsx,ts,tsx}"],
    rules: {
      // Custom rules for healthcare data handling
      "no-restricted-properties": [
        "error",
        {
          "object": "console",
          "property": "log",
          "message": "Avoid console.log in production. Use proper logging for audit trails."
        }
      ],
      "no-restricted-syntax": [
        "error",
        {
          "selector": "Literal[value=/ssn|social.*security|date.*birth|dob/i]",
          "message": "Avoid hardcoded sensitive data patterns that could violate HIPAA."
        }
      ],
    },
  },

  // Ignore patterns
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "playwright-report/**",
      "test-results/**",
      "public/**",
      "*.min.js",
      ".env*",
      "*.log",
    ],
  },
];

export default eslintConfig;
