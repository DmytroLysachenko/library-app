"use client";

import React from "react";
import { Session } from "next-auth";

import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import UserTableRecord from "./UserTableRecord";

const UsersTable = ({
  users,
  type,
  isTestAccount,
  session,
}: {
  users: User[];
  type: "users" | "requests";
  isTestAccount?: boolean;
  session?: Session | null;
}) => {
  const isUsersTable = type === "users";

  return (
    <div className="rounded-md border mt-7">
      <Table>
        <TableHeader className="bg-slate-100">
          <TableRow>
            <TableHead>Status</TableHead>

            <TableHead>Name</TableHead>

            <TableHead>Date Joined</TableHead>

            {isUsersTable && (
              <>
                <TableHead>Role</TableHead>
                <TableHead>Books Borrowed</TableHead>
              </>
            )}

            <TableHead>University ID No</TableHead>

            <TableHead>University ID Card</TableHead>

            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {users.map((user) => (
            <UserTableRecord
              key={user.id}
              isCurrentUser={user.id === session?.user?.id}
              user={user}
              isUsersTable={isUsersTable}
              isTestAccount={isTestAccount}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
