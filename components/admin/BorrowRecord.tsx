import React from "react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import { TableCell, TableRow } from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import BookCover from "../BookCover";
import UserAvatar from "../UserAvatar";
import { cn, getNextStatus } from "@/lib/utils";
import {
  confirmBookBorrowStatus,
  confirmBookReturnStatus,
  generateReceipt,
} from "@/lib/admin/actions/records";
import { toast } from "@/lib/actions/hooks/use-toast";
import ReceiptLink from "./ReceiptLink";

const BorrowRecord = ({
  record,
  book,
  user,
  isRequest,
}: {
  record: Omit<BorrowRecord, "book" | "user">;
  book: Book;
  user: User;
  isRequest?: boolean;
}) => {
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [status, setStatus] = React.useState(record.status);
  const [dueDate, setDueDate] = React.useState<Date | null>(record.dueDate);

  const isReceiptValid = record.receiptCreatedAt
    ? dayjs().diff(dayjs(record.receiptCreatedAt), "day") < 1
    : false;

  const [canGenerateReceipt, setCanGenerateReceipt] = React.useState(
    (!Boolean(record.receiptUrl) && record.status !== "PENDING") ||
      (Boolean(record.receiptUrl) && !isReceiptValid)
  );

  const router = useRouter();

  const inTimeReturn =
    (record.dueDate ? new Date(record.dueDate) : new Date()) >=
    (record.returnDate ? new Date(record.returnDate) : new Date());

  const nextStatus = getNextStatus(status);

  const onChangeBorrowStatus = async (value: "BORROWED" | "RETURNED") => {
    setIsChangingStatus(true);

    const response =
      value === "BORROWED"
        ? await confirmBookBorrowStatus(record.id)
        : await confirmBookReturnStatus(record.id);

    if (response?.success) {
      if (value === "BORROWED") setCanGenerateReceipt(true);
      setStatus(value);
      setDueDate(dayjs().add(7, "day").toDate());
      toast({
        title: "Success",
        description: "Record status changed successfully",
      });
    } else {
      setStatus(record.status);
      toast({
        title: "Error",
        description: "An error occurred during status change",
        variant: "destructive",
      });
    }

    setIsChangingStatus(false);
  };

  const onGenerateReceipt = async () => {
    setIsChangingStatus(true);
    const response = await generateReceipt(record.id);
    if (response.success) {
      toast({
        title: "Success",
        description: "Receipt generated successfully",
      });
      setCanGenerateReceipt(false);
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
    setIsChangingStatus(false);
    router.refresh();
  };

  return (
    <TableRow key={record.id}>
      <TableCell>
        <div className="flex items-center gap-3">
          <BookCover
            coverUrl={book.coverUrl}
            variant="small"
            coverColor={book.coverColor}
          />
          <span className="font-medium text-xs">{book.title}</span>
        </div>
      </TableCell>

      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={user.fullName}
            className="w-10 h-10"
          />

          <div className="flex flex-col  text-xs ">
            <span className="font-medium ">{user.fullName}</span>

            <span className=" text-muted-foreground">{user.email}</span>
          </div>
        </div>
      </TableCell>

      {isRequest ? (
        <TableCell>
          {nextStatus ? (
            <Select
              value={status}
              disabled={isChangingStatus || status === "RETURNED"}
              onValueChange={onChangeBorrowStatus}
            >
              <SelectTrigger
                className={cn(
                  "max-w-30 text-xs",
                  inTimeReturn ? "bg-purple-100" : "bg-red-300"
                )}
              >
                <SelectValue>{status}</SelectValue>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value={nextStatus}>
                  <span
                    className={cn(
                      "text-xs",
                      inTimeReturn ? "text-purple-500" : "text-red-500"
                    )}
                  >
                    {nextStatus === "BORROWED"
                      ? "Borrowed"
                      : inTimeReturn
                        ? "Returned in time"
                        : "Late Return"}
                  </span>
                </SelectItem>
              </SelectContent>
            </Select>
          ) : (
            <div className="text-sm text-muted-foreground">
              No further action
            </div>
          )}
        </TableCell>
      ) : (
        <TableCell
          className={cn(
            "text-xs",
            inTimeReturn ? "text-purple-500" : "text-red-500"
          )}
        >
          {nextStatus === "BORROWED"
            ? "Borrowed"
            : inTimeReturn
              ? "Returned in time"
              : "Late Return"}
        </TableCell>
      )}

      <TableCell className="text-xs">
        {dayjs(record.createdAt).format("YYYY-MM-DD")}
      </TableCell>

      {!isRequest && (
        <TableCell className="text-xs">
          {record.returnDate
            ? dayjs(record.returnDate).format("YYYY-MM-DD")
            : status === "RETURNED"
              ? dayjs().format("YYYY-MM-DD")
              : "N/A"}
        </TableCell>
      )}

      <TableCell className="text-xs">
        {dueDate
          ? dayjs(dueDate).format("YYYY-MM-DD")
          : status === "RETURNED"
            ? dayjs().format("YYYY-MM-DD")
            : "N/A"}
      </TableCell>

      <TableCell className="text-xs">
        <ReceiptLink
          isChangingStatus={isChangingStatus}
          canGenerateReceipt={canGenerateReceipt}
          receiptUrl={record.receiptUrl}
          onGenerateReceipt={onGenerateReceipt}
          isReceiptValid={isReceiptValid}
        />
      </TableCell>
    </TableRow>
  );
};

export default BorrowRecord;
