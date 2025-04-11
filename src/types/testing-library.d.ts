
import '@testing-library/jest-dom';

declare global {
  namespace jest {
    interface Matchers<R, T> {
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
