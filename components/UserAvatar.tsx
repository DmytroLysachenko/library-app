import React from "react";

import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import config from "@/lib/config";
import { getInitials } from "@/lib/utils";

const UserAvatar = ({
  avatarUrl,
  fullName,
  className,
}: {
  avatarUrl?: string | null;
  fullName?: string;
  className?: string;
}) => {
  return (
    <Avatar className={className}>
      <AvatarImage
        src={
          avatarUrl ? config.env.imagekit.urlEndpoint + avatarUrl : undefined
        }
      />
      <AvatarFallback className="bg-amber-100">
        {getInitials(fullName || "IN")}
      </AvatarFallback>
    </Avatar>
  );
};

export default UserAvatar;
