import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";

jest.mock("lucide-react", () => ({
  __esModule: true,
  FileText: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="file-text-icon" {...props} />
  ),
  LoaderCircle: (props: React.SVGProps<SVGSVGElement>) => (
    <svg data-testid="loader-icon" {...props} />
  ),
}));

jest.mock("next/link", () => {
  const LinkMock = React.forwardRef<
    HTMLAnchorElement,
    React.PropsWithChildren<React.AnchorHTMLAttributes<HTMLAnchorElement>>
  >(({ children, ...rest }, ref) => (
    <a ref={ref} {...rest}>
      {children}
    </a>
  ));

  LinkMock.displayName = "NextLinkMock";

  return LinkMock;
});

import ReceiptLink from "@/components/admin/ReceiptLink";

const renderReceiptLink = (
  props: Partial<React.ComponentProps<typeof ReceiptLink>> = {}
) => {
  const defaultProps: React.ComponentProps<typeof ReceiptLink> = {
    isChangingStatus: false,
    canGenerateReceipt: false,
    receiptUrl: null,
    onGenerateReceipt: jest.fn(),
    isReceiptValid: false,
  };

  return render(<ReceiptLink {...defaultProps} {...props} />);
};

describe("ReceiptLink", () => {
  it("shows a loader when the status is changing", () => {
    renderReceiptLink({ isChangingStatus: true });

    expect(screen.getByTestId("loader-icon")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders a generate button when a receipt can be created", () => {
    const onGenerateReceipt = jest.fn();
    renderReceiptLink({ canGenerateReceipt: true, onGenerateReceipt });

    const generateButton = screen.getByRole("button", { name: /generate/i });
    fireEvent.click(generateButton);

    expect(onGenerateReceipt).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders a link to the receipt when one is available and valid", () => {
    const receiptUrl = "https://cdn.example/receipt.pdf";
    renderReceiptLink({ receiptUrl, isReceiptValid: true });

    const receiptLink = screen.getByRole("link", { name: /open/i });
    expect(receiptLink).toHaveAttribute("href", receiptUrl);
    expect(screen.getByTestId("file-text-icon")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /generate/i })).not.toBeInTheDocument();
  });

  it("falls back to an unavailable state when no receipt can be generated or opened", () => {
    renderReceiptLink({ receiptUrl: "https://cdn.example/receipt.pdf", isReceiptValid: false });

    expect(screen.getByText("N/A")).toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });
});
