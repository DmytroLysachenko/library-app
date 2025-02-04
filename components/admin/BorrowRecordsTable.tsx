"use client";

import React from "react";
import { FileText } from "lucide-react";
import dayjs from "dayjs";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import BookCover from "../BookCover";
import UserAvatar from "../UserAvatar";
import { cn } from "@/lib/utils";
import {
  confirmBookBorrowStatus,
  confirmBookReturnStatus,
  generateReceipt,
} from "@/lib/admin/actions/records";
import { toast } from "@/lib/actions/hooks/use-toast";
import Link from "next/link";

const BorrowRecordsTable = ({
  records,
  isRequest,
}: {
  records: BorrowRecord[];
  isRequest?: boolean;
}) => {
  return (
    <div className="rounded-md border mt-7">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book</TableHead>
            <TableHead>User Requested</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Borrowed date</TableHead>
            <TableHead>Return date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map(({ book, user, ...record }) => (
            <BorrowRecord
              key={record.id}
              record={record}
              book={book}
              user={user}
              isRequest={isRequest}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

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
  const [canGenerateReceipt, setCanGenerateReceipt] = React.useState(
    !Boolean(record.receiptUrl) && record.status !== "PENDING"
  );

  console.log(
    !Boolean(record.receiptUrl),
    record.receiptUrl,
    record.status !== "PENDING",
    record.status
  );

  const inTimeReturn =
    (record.dueDate ? new Date(record.dueDate) : new Date()) >=
    (record.returnDate ? new Date(record.returnDate) : new Date());

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "PENDING":
        return "BORROWED";
      case "BORROWED":
        return "RETURNED";
      default:
        return null;
    }
  };

  const nextStatus = getNextStatus(status);

  const onChangeBorrowStatus = async (value: "BORROWED" | "RETURNED") => {
    setIsChangingStatus(true);

    let response;

    if (value === "BORROWED") {
      response = await confirmBookBorrowStatus(record.id);
    } else if (value === "RETURNED") {
      response = await confirmBookReturnStatus(record.id);
    }

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
    } else {
      toast({
        title: "Error",
        description: response.message,
        variant: "destructive",
      });
    }
    setIsChangingStatus(false);
    setCanGenerateReceipt(false);
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
          <span className="font-medium">{book.title}</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-3">
          <UserAvatar
            avatarUrl={user.avatar}
            fullName={user.fullName}
            className="w-12 h-12"
          />

          <div className="flex flex-col">
            <span className="font-medium">{user.fullName}</span>
            <span className="text-sm text-muted-foreground">{user.email}</span>
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
                  "w-36 text-xs",
                  inTimeReturn ? "bg-purple-100" : "bg-red-300"
                )}
              >
                <SelectValue>{status}</SelectValue>
              </SelectTrigger>

              <SelectContent className="w-36 text-xs">
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
            "text-md",
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
      <TableCell>{dayjs(record.createdAt).format("YYYY-MM-DD")}</TableCell>
      <TableCell>
        {record.returnDate
          ? dayjs(record.returnDate).format("YYYY-MM-DD")
          : status === "RETURNED"
            ? dayjs().format("YYYY-MM-DD")
            : "N/A"}
      </TableCell>
      <TableCell>
        {dueDate
          ? dayjs(dueDate).format("YYYY-MM-DD")
          : status === "RETURNED"
            ? dayjs().format("YYYY-MM-DD")
            : "N/A"}
      </TableCell>
      <TableCell>
        {canGenerateReceipt ? (
          <Button
            variant="link"
            className="px-0 text-blue-500"
            onClick={onGenerateReceipt}
          >
            Generate
            <FileText className="h-4 w-4 ml-1" />
          </Button>
        ) : record.receiptUrl ? (
          <Button
            variant="link"
            className="px-0 text-blue-500"
            asChild
          >
            <Link
              target="_blank"
              href={record.receiptUrl}
            >
              Open
              <FileText className="h-4 w-4 ml-1" />
            </Link>
          </Button>
        ) : (
          <p>N/A</p>
        )}
      </TableCell>
    </TableRow>
  );
};

export default BorrowRecordsTable;
