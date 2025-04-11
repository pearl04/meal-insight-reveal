
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

// Register custom queries
import { configure } from '@testing-library/react';
import { getByAcceptingDroppableFiles } from './src/utils/test-utils';

// Create the query interfaces with all three query variants
const queryByAcceptingDroppableFiles = (container) => {
  const input = getByAcceptingDroppableFiles(container);
  return input || null;
};

const findByAcceptingDroppableFiles = async (container) => {
  const input = getByAcceptingDroppableFiles(container);
  if (!input) {
    throw new Error('Unable to find an element accepting droppable files');
  }
  return input;
};

// Extend the queries with custom ones
const customQueries = { 
  getByAcceptingDroppableFiles,
  queryByAcceptingDroppableFiles,
  findByAcceptingDroppableFiles
};

// Configure custom queries to be available
configure({ queries: customQueries });
