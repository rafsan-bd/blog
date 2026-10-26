import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

const rec = firebaseRulesPlugin.configs['flat/recommended'];

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*'],
  },
  ...(Array.isArray(rec) ? rec : [rec]),
];

