import React from "react";
import Link from "next/link";
import dayjs from "dayjs";
import { CircleX, ExternalLink, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Button } from "../ui/button";
import config from "@/lib/config";
import {
  approveUser,
  changeUserRole,
  deleteUser,
  rejectUser,
} from "@/lib/admin/actions/users";
import { toast } from "@/lib/actions/hooks/use-toast";
import UserAvatar from "../UserAvatar";
import { Badge } from "../ui/badge";
import { cn, getStatusBadgeColor } from "@/lib/utils";
import { TableCell, TableRow } from "../ui/table";

const UserTableRecord = ({
  user,
  isUsersTable,
  isCurrentUser,
  isTestAccount,
}: {
  user: User;
  isUsersTable: boolean;
  isCurrentUser?: boolean;
  isTestAccount?: boolean;
}) => {
  const router = useRouter();
  const [isChangingStatus, setIsChangingStatus] = React.useState(false);
  const [userRole, setUserRole] = React.useState(user.role);
  return (
    <TableRow key={user.id}>
      <TableCell>
        <Badge className={`${getStatusBadgeColor(user.status)}`}>
          {user.status === "APPROVED" ? (
            user.status
          ) : (
            <Link href="/admin/account-requests">{user.status}</Link>
          )}
        </Badge>
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

      <TableCell>{dayjs(user.createdAt).format("DD/MM/YYYY")}</TableCell>
      {isUsersTable && (
        <>
          <TableCell>
            <Select
              value={userRole}
              disabled={isChangingStatus || isTestAccount}
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
                className={cn(
                  "w-24",
                  userRole === "ADMIN" ? "text-green-500" : "text-rose-500"
                )}
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
              router.refresh();
            }}
          >
            Approve User
          </Button>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 text-right"
          disabled={isCurrentUser}
          onClick={async () => {
            if (isTestAccount) {
              alert("You cannot delete from a test account.");
              return;
            }

            if (isUsersTable) {
              await deleteUser(user.id!);
            } else {
              await rejectUser(user.id!);
            }

            router.refresh();
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

export default UserTableRecord;
