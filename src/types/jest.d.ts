
// This file provides TypeScript type definitions for Jest testing

import '@testing-library/jest-dom';

declare global {
  // Extend Jest matchers
  namespace jest {
    interface Matchers<R> {
      toHaveAttribute(attr: string, value?: any): R;
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      // Add other matchers as needed
    }

    // Add MockedFunction type
    type MockedFunction<T extends (...args: any) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;
  }
}

// Extend expect interface
declare module '@testing-library/jest-dom' {
  // Add any additional custom matchers here if needed
}

// For screen augmentation
declare module '@testing-library/react' {
  interface Screen {
    getByAcceptingDroppableFiles: () => HTMLInputElement;
  }
}
