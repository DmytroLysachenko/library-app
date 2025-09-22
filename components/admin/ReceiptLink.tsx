import React from "react";
import { FileText, LoaderCircle } from "lucide-react";
import Link from "next/link";

import { Button } from "../ui/button";

interface ReceiptLinkProps {
  isChangingStatus: boolean;
  canGenerateReceipt: boolean;
  receiptUrl: string | null;
  onGenerateReceipt: () => void;
  isReceiptValid: boolean;
}

const ReceiptLink = ({
  isChangingStatus,
  canGenerateReceipt,
  receiptUrl,
  onGenerateReceipt,
  isReceiptValid,
}: ReceiptLinkProps) => {
  return isChangingStatus ? (
    <LoaderCircle className="animate-spin mx-auto" />
  ) : canGenerateReceipt ? (
    <Button
      variant="link"
      className="px-0 text-blue-500 text-xs"
      onClick={onGenerateReceipt}
    >
      Generate
      <FileText className="h-4 w-4 ml-1" />
    </Button>
  ) : receiptUrl && isReceiptValid ? (
    <Button
      variant="link"
      className="px-0 text-blue-500"
      asChild
    >
      <Link
        target="_blank"
        href={receiptUrl}
      >
        Open
        <FileText className="h-4 w-4 ml-1" />
      </Link>
    </Button>
  ) : (
    <p>N/A</p>
  );
};

export default ReceiptLink;
