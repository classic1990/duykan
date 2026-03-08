// Jest setup file
global.console = {
    ...console,
    // Suppress console.log during tests
    log: jest.fn(),
    // Keep error and warn for debugging
    error: console.error,
    warn: console.warn,
    info: console.info,
    debug: console.debug
};

// Mock fetch if needed
global.fetch = jest.fn();

// Set default timeout
jest.setTimeout(10000);
