
import '@testing-library/jest-dom';

// Extend the Jest matchers for DOM testing
declare global {
  namespace jest {
    // The full interface defining all available matchers from jest-dom
    interface Matchers<R, T = {}> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: any): R;
      // Add any other matchers you are using
    }
  }
}

// Export empty to make it a module
export {};
