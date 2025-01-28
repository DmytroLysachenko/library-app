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
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { CircleX, ExternalLink, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import config from "@/lib/config";
import {
  approveUser,
  changeUserRole,
  deleteUser,
  rejectUser,
} from "@/lib/admin/actions/users";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";
import UserAvatar from "../UserAvatar";
import Image from "next/image";

const UsersTable = ({
  users,
  type,
}: {
  users: User[];
  type: "users" | "requests";
}) => {
  const isUsersTable = type === "users";

  return (
    <div className="rounded-md border mt-7">
      <Table>
        <TableHeader className="bg-slate-100">
          <TableRow>
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
            <UserRecord
              key={user.id}
              user={user}
              isUsersTable={isUsersTable}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

const UserRecord = ({
  user,
  isUsersTable,
}: {
  user: User;
  isUsersTable: boolean;
}) => {
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [userRole, setUserRole] = React.useState(user.role);
  return (
    <TableRow key={user.id}>
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
      <TableCell>{dayjs(user.createdAt).format("DD/MM/YYYY")}</TableCell>
      {isUsersTable && (
        <>
          <TableCell>
            <Select
              value={userRole}
              disabled={isChangingStatus}
              onValueChange={async (value: "USER" | "ADMIN") => {
                try {
                  setIsChangingStatus(true);
                  await changeUserRole(user.id, value);
                  toast({
                    title: "Success",
                    description: "User role changed successfully",
                  });
                  setUserRole(value);
                } catch (error) {
                  console.log(error);
                  toast({
                    title: "Error",
                    description: "An error occurred. Please try again.",
                    variant: "destructive",
                  });
                  setUserRole(user.role);
                } finally {
                  setIsChangingStatus(false);
                }
              }}
            >
              <SelectTrigger
                className={`w-24 ${user.role === "ADMIN" ? "text-green-500" : "text-rose-500"}`}
              >
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="USER">
                  <span className="text-rose-500">User</span>
                </SelectItem>

                <SelectItem value="ADMIN">
                  <span className="text-green-500">Admin</span>
                </SelectItem>
              </SelectContent>
            </Select>
          </TableCell>

          <TableCell>{user.borrowedBooks}</TableCell>
        </>
      )}
      <TableCell>{user.universityId}</TableCell>
      <TableCell>
        <Button
          variant="link"
          className="px-0 text-blue-500"
          asChild
        >
          <Link
            href={config.env.imagekit.urlEndpoint + user.universityCard}
            target="_blank"
          >
            View ID Card <ExternalLink className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </TableCell>

      <TableCell className="flex justify-between items-center">
        {!isUsersTable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-right text-green-700"
            onClick={async () => {
              await approveUser(user.id!);
              window.location.reload();
            }}
          >
            Approve User
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-right"
          onClick={async () => {
            if (isUsersTable) {
              await deleteUser(user.id!);
            } else {
              await rejectUser(user.id!);
            }

            window.location.reload();
          }}
        >
          {isUsersTable ? (
            <Trash2
              width={24}
              height={24}
              className=" text-red-700"
            />
          ) : (
            <CircleX
              width={24}
              height={24}
              className=" text-red-700"
            />
          )}
        </Button>
      </TableCell>
    </TableRow>
  );
};

export default UsersTable;
