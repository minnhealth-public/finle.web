import type { Config } from 'jest';

const config: Config = {
  testEnvironment: "jsdom",
  verbose: true,
  setupFilesAfterEnv: ["./src/setupTests.js"],
  globals: {},
  /*
  moduleNameMapper: {
    "^axios$": "axios/dist/node/axios.cjs"
  }
  */
};

export default config;
