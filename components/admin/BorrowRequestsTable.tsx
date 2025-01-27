"use client";

import React from "react";
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
import { FileText } from "lucide-react";
import BookCover from "../BookCover";
import UserAvatar from "../UserAvatar";
import dayjs from "dayjs";
import { cn } from "@/lib/utils";
import { changeRecordStatus } from "@/lib/admin/actions/records";
import { toast } from "@/hooks/use-toast";

const BorrowRequestsTable = ({ records }: { records: BorrowRecord[] }) => {
  return (
    <div className="rounded-md border mt-7">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Book</TableHead>
            <TableHead>User Requested</TableHead>
            <TableHead>Borrowed status</TableHead>
            <TableHead>Borrowed date</TableHead>
            <TableHead>Return date</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {records.map(({ book, user, ...record }) => (
            <BorrowRequestRecord
              key={record.id}
              record={record}
              book={book}
              user={user}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const BorrowRequestRecord = ({
  record,
  book,
  user,
}: {
  record: Omit<BorrowRecord, "book" | "user">;
  book: Book;
  user: User;
}) => {
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [status, setStatus] = React.useState(record.status);

  const inTimeReturn =
    new Date(record.dueDate) >=
    (record.returnDate ? new Date(record.returnDate) : new Date());

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
      <TableCell>
        <Select
          value={status}
          disabled={isChangingStatus}
          onValueChange={async (value: "BORROWED" | "RETURNED") => {
            try {
              setIsChangingStatus(true);
              await changeRecordStatus(record.id, value);
              setStatus(value);
              toast({
                title: "Success",
                description: "Record status changed successfully",
              });
            } catch (error) {
              console.log(error);

              toast({
                title: "Error",
                description: "An error occurred. Please try again.",
                variant: "destructive",
              });
              setStatus(record.status);
            } finally {
              setIsChangingStatus(false);
            }
          }}
        >
          <SelectTrigger
            className={cn(
              "w-36 text-xs",
              inTimeReturn ? "bg-purple-100" : "bg-red-300"
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="w-36 text-xs">
            <SelectItem value="BORROWED">
              <span
                className={cn(
                  "text-xs",
                  inTimeReturn ? "text-purple-500" : "text-red-500"
                )}
              >
                Borrowed
              </span>
            </SelectItem>
            <SelectItem value="RETURNED">
              <span
                className={cn(
                  "text-xs",
                  inTimeReturn ? "text-blue-500" : "text-red-500"
                )}
              >
                {inTimeReturn ? "Returned in Time" : "Late Return"}
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell>{dayjs(record.createdAt).format("YYYY-MM-DD")}</TableCell>
      <TableCell>
        {record.returnDate
          ? dayjs(record.returnDate).format("YYYY-MM-DD")
          : status === "RETURNED"
            ? dayjs().format("YYYY-MM-DD")
            : "N/A"}
      </TableCell>
      <TableCell>{dayjs(record.dueDate).format("YYYY-MM-DD")}</TableCell>
      <TableCell>
        <Button
          variant="link"
          className="px-0 text-blue-500"
        >
          Generate
          <FileText className="h-4 w-4 ml-1" />
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default BorrowRequestsTable;
