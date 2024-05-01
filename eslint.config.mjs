import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import eslintTypescript from 'typescript-eslint';

export default eslintTypescript.config(
    {
        ignores: ['**/node_modules', '**/dist', '**/*.js', '**/*.mjs', '**/*.cjs'],
    },
    eslint.configs.recommended,
    ...eslintTypescript.configs.recommended,
    eslintPluginPrettierRecommended,
    {
        rules: {
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/no-explicit-any': 'warn',
            'no-unused-vars': 'off', // eslint 충돌로 인한 에러 발생
            'comma-dangle': ['warn', 'always-multiline'],
            semi: 'warn',
            indent: ['warn', 4, { SwitchCase: 1, ignoredNodes: ['PropertyDefinition'] }],
            'prettier/prettier': 'warn',
        },
    },
);