
import React, { ReactElement } from 'react';
import { render, RenderOptions, screen, queries } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ToastProvider } from '@/components/ui/toast';
import '@testing-library/jest-dom';

// Create a custom render function that includes providers
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <ToastProvider>{children}</ToastProvider>;
  };
  
  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options })
  };
};

// Mock file creation for tests
export const createMockFile = (
  name: string = 'meal.jpg', 
  type: string = 'image/jpeg', 
  size: number = 1024
): File => {
  const file = new File(['mock file content'], name, { type });
  Object.defineProperty(file, 'size', { value: size });
  return file;
};

// Helper function for finding file inputs in tests
export const getByAcceptingDroppableFiles = (container: HTMLElement): HTMLInputElement => {
  return container.querySelector('input[type="file"]')!;
};

// Export everything from testing library
export * from '@testing-library/react';
export { customRender as render };
