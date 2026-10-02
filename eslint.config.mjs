import js from '@eslint/js';
import tsParser from '@typescript-eslint/parser';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import astro from 'eslint-plugin-astro';
import globals from 'globals';

export default [
	{ ignores: ['dist/**', '.astro/**', 'node_modules/**'] },
	js.configs.recommended,
	...astro.configs['flat/recommended'],
	{
		files: ['**/*.{ts,tsx,js,jsx,mjs,cjs}'],
		languageOptions: {
			parser: tsParser,
			parserOptions: { ecmaVersion: 'latest', sourceType: 'module', ecmaFeatures: { jsx: true } },
			globals: { ...globals.browser, ...globals.node },
		},
		plugins: { '@typescript-eslint': tsPlugin },
		rules: { ...tsPlugin.configs.recommended.rules, 'no-undef': 'off' },
	},
	{ files: ['**/*.astro'], languageOptions: { globals: { ...globals.browser, ...globals.node } } },
];
