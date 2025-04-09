
// This file provides TypeScript type definitions for Jest testing

import "@testing-library/jest-dom";
import { expect } from "@jest/globals";

declare global {
  // Extend Jest matchers
  namespace jest {
    interface Matchers<R> {
      toHaveAttribute(attr: string, value?: any): R;
    }

    // Add MockedFunction type
    type MockedFunction<T extends (...args: any) => any> = jest.Mock<ReturnType<T>, Parameters<T>>;
  }
}
