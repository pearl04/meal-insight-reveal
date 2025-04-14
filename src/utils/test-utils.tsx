import React, { ReactElement } from "react";
import { render, RenderOptions } from "@testing-library/react";
import { userEvent } from "@testing-library/user-event";
import { ToastProvider } from "@/components/ui/toast";
import "@testing-library/jest-dom";

// Custom render with context provider
const customRender = (
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) => {
  const AllProviders = ({ children }: { children: React.ReactNode }) => {
    return <ToastProvider>{children}</ToastProvider>;
  };

  return {
    user: userEvent.setup(),
    ...render(ui, { wrapper: AllProviders, ...options }),
  };
};

// Export everything useful
export * from "@testing-library/react";
export { customRender as render };
