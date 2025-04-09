
// Add Jest DOM matchers
import '@testing-library/jest-dom';
import { jest } from '@jest/globals';

// Mock the matchMedia function which is not available in the Jest environment
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
class MockIntersectionObserver {
  constructor(callback) {
    this.callback = callback;
  }
  observe = jest.fn();
  unobserve = jest.fn();
  disconnect = jest.fn();
}

Object.defineProperty(window, 'IntersectionObserver', {
  writable: true,
  value: MockIntersectionObserver,
});

// This part comes last to ensure everything else is loaded first
import { screen } from '@testing-library/react';
import { getByAcceptingDroppableFiles } from './src/utils/test-utils';

// Extend screen with custom queries - using a try/catch to handle potential errors
try {
  screen.getByAcceptingDroppableFiles = getByAcceptingDroppableFiles;
} catch (e) {
  console.warn('Could not extend screen with custom queries:', e);
}
