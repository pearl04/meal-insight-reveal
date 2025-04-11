
import '@testing-library/jest-dom';

// These type definitions allow us to use the custom matchers in our tests
declare global {
  namespace jest {
    interface Matchers<R, T = {}> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveTextContent(text: string | RegExp): R;
      toHaveValue(value: any): R;
    }
  }
}

// Add the custom query to the Screen interface
declare module '@testing-library/react' {
  interface Screen {
    getByAcceptingDroppableFiles(): HTMLElement;
    queryByAcceptingDroppableFiles(): HTMLElement | null;
    findByAcceptingDroppableFiles(): Promise<HTMLElement>;
  }
  
  interface Queries {
    getByAcceptingDroppableFiles: (container: HTMLElement) => HTMLElement;
    queryByAcceptingDroppableFiles: (container: HTMLElement) => HTMLElement | null;
    findByAcceptingDroppableFiles: (container: HTMLElement) => Promise<HTMLElement>;
  }
}

// Export empty to make it a module
export {};
