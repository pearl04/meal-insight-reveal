
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveAttribute(attr: string, value?: string): R;
      toContainElement(element: HTMLElement | null): R;
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
}
