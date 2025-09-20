module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/api/**/*.spec.js'],
  collectCoverageFrom: [
    'backend/**/*.mo',
    '!**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/api/setup.js'],
  testTimeout: 30000,
};
