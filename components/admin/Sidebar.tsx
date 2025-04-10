"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminSideBarLinks } from "@/constants";
import { cn } from "@/lib/utils";
import UserAvatar from "../UserAvatar";

const Sidebar = ({ user }: { user: Partial<User> }) => {
  const pathname = usePathname();

  return (
    <div className="admin-sidebar">
      <div>
        <Link
          href="/"
          className="logo"
        >
          <Image
            src="/icons/admin/logo.svg"
            alt="logo"
            width={37}
            height={37}
          />
          <h1>LibraryView</h1>
        </Link>
        <div className="mt-10 flex flex-col gap-5">
          {adminSideBarLinks.map((link) => {
            const isSelected =
              (link.route !== "/admin" &&
                pathname.includes(link.route) &&
                link.route.length > 1) ||
              pathname === link.route;

            return (
              <Link
                href={link.route}
                key={link.route}
              >
                <div
                  className={cn(
                    "link",
                    isSelected && "bg-primary-admin shadow-sm"
                  )}
                >
                  <div className="relative size-5">
                    <Image
                      src={link.img}
                      alt="icon"
                      fill
                      className={`${isSelected ? "brightness-0 invert" : ""} object-contain`}
                    />
                  </div>
                  <p className={cn(isSelected ? "text-white" : "text-dark")}>
                    {link.text}
                  </p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
      <div className="user">
        <UserAvatar
          avatarUrl={user.avatar}
          fullName={user.fullName}
          className="w-12 h-12"
        />
        <div className="flex flex-col max-md:hidden">
          <p className="font-semibold text-dark-200">{user?.fullName}</p>
          <p className="text-light-500 text-xs">{user?.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
