"use client";

import React from "react";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import BorrowRecord from "./BorrowRecord";

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

            <TableHead>User {isRequest ? "Requested" : "Borrowed"}</TableHead>

            <TableHead>Status</TableHead>

            <TableHead>{isRequest ? "Request" : "Borrowed"} date</TableHead>

            {!isRequest && <TableHead>Return date</TableHead>}

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

export default BorrowRecordsTable;
