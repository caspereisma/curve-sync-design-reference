import js from '@eslint/js';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import tseslint from 'typescript-eslint';

export default tseslint.config(
    { ignores: ['dist/**', 'coverage/**'] },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        // Node tooling: bin/snap.mjs, scripts/*.mjs. `document` appears inside
        // page.evaluate callbacks, which run in the browser, not in Node.
        files: ['bin/**/*.mjs', 'scripts/**/*.mjs'],
        languageOptions: {
            globals: {
                console: 'readonly',
                process: 'readonly',
                fetch: 'readonly',
                document: 'readonly'
            }
        }
    },
    {
        plugins: {
            react: reactPlugin,
            'react-hooks': reactHooks
        },
        rules: {
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',
            '@typescript-eslint/no-explicit-any': 'error',
            '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }]
        },
        settings: {
            react: { version: 'detect' }
        }
    }
);
