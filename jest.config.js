/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  rootDir: "./test",
  collectCoverage: true,
  collectCoverageFrom: ['./src/**/*.{ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/dist/'],
  transform: {
    "^.+\\.tsx?$": ["ts-jest", {
      isolatedModules: true,
      tsconfig: './test/tsconfig.json',
    }]
  },
};