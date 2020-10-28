module.exports = {
  preset: "@vue/cli-plugin-unit-jest/presets/typescript-and-babel",
  setupFilesAfterEnv: ["<rootDir>/tests/unit/setup.ts"],
  globals: {
    "vue-jest": {
      babelConfig: true
    },
    "ts-jest": {
      babelConfig: false,
      diagnostics: false
    }
  }
};
