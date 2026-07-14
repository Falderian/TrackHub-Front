/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.ts"],
  moduleNameMapper: {
    "^expo-location$": "<rootDir>/__mocks__/expo-location.ts",
    "^expo-sensors$": "<rootDir>/__mocks__/expo-sensors.ts",
    "^expo-task-manager$": "<rootDir>/__mocks__/expo-task-manager.ts",
    "^expo-secure-store$": "<rootDir>/__mocks__/expo-secure-store.ts",
    "^@react-native-async-storage/async-storage$": "<rootDir>/__mocks__/async-storage.ts",
  },
  transform: {
    "^.+\\.tsx?$": ["ts-jest", { tsconfig: "tsconfig.json", diagnostics: false }],
  },
};
