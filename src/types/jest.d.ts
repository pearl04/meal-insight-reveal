
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R> {
      toHaveAttribute(attr: string, value?: any): R;
      toBeInTheDocument(): R;
      toHaveClass(className: string): R;
      toBeVisible(): R;
      toHaveTextContent(text: string): R;
      toContainElement(element: HTMLElement | null): R;
      toHaveValue(value: any): R;
    }
  }
}

// For screen augmentation
declare module '@testing-library/react' {
  export interface Screen {
    getByAcceptingDroppableFiles: () => HTMLInputElement;
  }
}
