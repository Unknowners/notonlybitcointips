// Setup file for API tests
// This file runs before each test file

// Set longer timeout for canister calls
jest.setTimeout(30000);

// Global test utilities
global.sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Mock console methods to reduce noise during tests
const originalConsole = console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  warn: jest.fn(),
  error: originalConsole.error, // Keep errors visible
};
