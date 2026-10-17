import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import jsxA11y from "eslint-plugin-jsx-a11y";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Barrierefreiheit: vollständiger strikter Regelsatz von jsx-a11y
  // (das Plugin selbst registriert eslint-config-next bereits).
  {
    files: ["**/*.{ts,tsx}"],
    rules: jsxA11y.flatConfigs.strict.rules,
  },
  globalIgnores([".next/**", "out/**", "build/**", "next-env.d.ts"]),
]);

export default eslintConfig;
