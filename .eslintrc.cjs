module.exports = {
    root: true,
    extends: [
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:prettier/recommended",
    ],
    parser: "@typescript-eslint/parser",
    parserOptions: {
        project: ['./tsconfig.json'],
    },
    rules: {
        "@typescript-eslint/no-explicit-any": "off",
        "@typescript-eslint/no-namespace": "off",
        "no-unexpected-multiline": "error",
        "no-inner-declarations": "off",
        "@typescript-eslint/ban-types": "off",
        "@typescript-eslint/no-use-before-define": "off",
        "@typescript-eslint/no-non-null-assertion": "off",
        "@typescript-eslint/no-empty-interface": "off",
        "@typescript-eslint/no-this-alias": "off",
    },
}
