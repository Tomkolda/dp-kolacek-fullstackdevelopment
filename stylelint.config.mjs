/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  customSyntax: 'postcss',
  rules: {
    // V projektu používáme CSS Modules a Mantine generované třídy (camelCase + .mantine-*)
    'selector-class-pattern': null,

    // Používáme PostCSS proměnné (např. $mantine-breakpoint-*)
    'media-query-no-invalid': null,

    // Povolit PostCSS direktivy z postcss-preset-mantine
    'at-rule-no-unknown': [
      true,
      {
        ignoreAtRules: [
          'mixin', // PostCSS mixin z postcss-preset-mantine
          'define-mixin',
          'apply',
          'nest',
          'r',
          'rem',
          'em',
        ],
      },
    ],
    // Povolit custom properties
    'custom-property-pattern': null,
    // Povolit PostCSS funkce z postcss-preset-mantine
    'function-no-unknown': [
      true,
      {
        ignoreFunctions: [
          'light-dark', // PostCSS funkce z postcss-preset-mantine
          'alpha',
          'r',
          'rem',
          'em',
        ],
      },
    ],

    // CSS Modules: povolit :global(...) / :local(...)
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global', 'local'],
      },
    ],
  },
  ignoreFiles: [
    // upstream / generované styly (nechceme je držet na stylelint pravidlech projektu)
    '**/*.js',
    '**/*.jsx',
    '**/*.ts',
    '**/*.tsx',
    'node_modules/**',
    '.next/**',
    'dist/**',
  ],
};
