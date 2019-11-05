module.exports = {
    env: {
        node: true,
        es6: true,
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    "plugins": ["@typescript-eslint"],

    /*
    parserOptions: {
        ecmaVersion: 9,
    },
    */
    extends: ['eslint:recommended', 'google',
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended"

    ],
    rules: {
        'object-curly-spacing': ['error', 'always'],
        'max-len': ['error', { code: 100 }],
        camelcase: 'off',
        '@typescript-eslint/camelcase': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        "@typescript-eslint/no-use-before-define": "off",
        curly: 'error',
        'brace-style': 'error',
        indent: ['error', 4],
        'no-console': 'off',
        'newline-before-return': 'error',
        'valid-jsdoc': 'off',
        'require-jsdoc': 'off',
        'new-cap': ['error', { capIsNewExceptions: ['Deferred'] }],
        'guard-for-in': 'off',
        'no-debugger': 'off',
    },
    globals: {
        // Globals provided by mocha. 'false' means they can't be written to.
        // See https://eslint.org/docs/user-guide/configuring#specifying-globals
        describe: false,
        it: false,
        before: false,
        after: false,
        beforeEach: false,

        $: false,
        apstag: false,
        confiant_write: false,
        document: false,
        FB: false,
        fbq: false,
        fbq_cbs: false,
        get_pbh_prebid_native: false,
        googletag: false,
        got_bid: false,
        Image: false,
        pbh_adjustments: false,
        PbhAdUnit: false,
        pbh_ad_units: false,
        pbh_collect: false,
        pbh_config: false,
        pbh_fbq: false,
        pbh_log: false,
        pbh_gaq: false,
        pbh_on_fbinit: false,
        pbh_post_id: false,
        pbh_refresh_ads: false,
        pbh_sandbox_iframe: false,
        pbjs: false,
        videojs: false,
        width: false,
        window: false,
    },
    overrides: [{
        files: ['**/*.js'],
        rules: {
            '@typescript-eslint/no-var-requires': 'off',
            '@typescript-eslint/no-unused-vars': 'off',
            "@typescript-eslint/explicit-function-return-type": "off",
            "@typescript-eslint/no-this-alias": "off",
        }
    }]
};
