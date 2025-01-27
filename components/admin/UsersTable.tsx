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
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { getInitials } from "@/lib/utils";
import dayjs from "dayjs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { ExternalLink, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import config from "@/lib/config";
import { changeUserRole, deleteUser } from "@/lib/admin/actions/users";
import { toast } from "@/hooks/use-toast";
import Link from "next/link";

const UsersTable = ({ users }: { users: User[] }) => {
  return (
    <div className="rounded-md border mt-7">
      <Table>
        <TableHeader className="bg-slate-100">
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Date Joined</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Books Borrowed</TableHead>
            <TableHead>University ID No</TableHead>
            <TableHead>University ID Card</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage
                      src={
                        user.avatar
                          ? config.env.imagekit.urlEndpoint + user.avatar
                          : undefined
                      }
                    />
                    <AvatarFallback className="bg-amber-100 w-full">
                      {getInitials(user.fullName) || "IN"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.fullName}</span>
                    <span className="text-sm text-muted-foreground">
                      {user.email}
                    </span>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {dayjs(user.createdAt).format("DD/MM/YYYY")}
              </TableCell>
              <TableCell>
                <Select
                  defaultValue={user.role || "USER"}
                  onValueChange={async (value: "USER" | "ADMIN") => {
                    try {
                      await changeUserRole(user.id, value);
                      toast({
                        title: "Success",
                        description: "User role changed successfully",
                      });
                    } catch (error) {
                      console.log(error);
                      toast({
                        title: "Error",
                        description: "An error occurred. Please try again.",
                        variant: "destructive",
                      });
                      window.location.reload();
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
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={async () => {
                    await deleteUser(user.id!);
                    window.location.reload();
                  }}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default UsersTable;
