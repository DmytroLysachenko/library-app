import React from "react";
import { render, screen } from "@testing-library/react";

jest.mock("@/components/ui/tooltip", () => {
  const Passthrough = ({ children }: { children: React.ReactNode }) => <>{children}</>;
  const Wrapper = (
    { children, ...props }: React.PropsWithChildren<Record<string, unknown>>
  ) => {
    const cleanProps: Record<string, unknown> & { asChild?: unknown } = { ...props };
    delete cleanProps.asChild;

    return <div {...cleanProps}>{children}</div>;
  };

  return {
    __esModule: true,
    TooltipProvider: Passthrough,
    Tooltip: Passthrough,
    TooltipTrigger: Wrapper,
    TooltipContent: Wrapper,
  };
});

import AutoRecorderIndicator from "@/components/admin/AutoRecorderIndicator";

const renderIndicator = (status: boolean) => render(<AutoRecorderIndicator status={status} />);

const getIndicatorDot = (label: string) => {
  const statusLabel = screen.getByText(label);
  const indicator = statusLabel.previousElementSibling as HTMLElement | null;
  expect(indicator).not.toBeNull();
  return indicator!;
};

describe("AutoRecorderIndicator", () => {
  it("renders the active state with a pulsing indicator and tooltip", () => {
    renderIndicator(true);

    expect(screen.getByText(/Auto Statistics Recorder : On/)).toBeInTheDocument();
    expect(screen.getByText(/Auto stats recording is On/)).toBeInTheDocument();

    const indicatorDot = getIndicatorDot("Auto Statistics Recorder : On");
    expect(indicatorDot).toHaveClass("bg-green-500");
    expect(indicatorDot).toHaveClass("animate-pulse");
  });

  it("renders the inactive state with a static indicator and tooltip", () => {
    renderIndicator(false);

    expect(screen.getByText(/Auto Statistics Recorder : Off/)).toBeInTheDocument();
    expect(screen.getByText(/Auto stats recording is Off/)).toBeInTheDocument();

    const indicatorDot = getIndicatorDot("Auto Statistics Recorder : Off");
    expect(indicatorDot).toHaveClass("bg-red-500");
    expect(indicatorDot).not.toHaveClass("animate-pulse");
  });
});
