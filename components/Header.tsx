"use client";
import Image from "next/image";
import Link from "next/link";
import React from "react";
import { LogOut } from "lucide-react";
import { redirect, usePathname } from "next/navigation";

import { cn } from "@/lib/utils";
import { signOutAction } from "@/lib/actions/auth";
import UserAvatar from "./UserAvatar";

const Header = ({ user }: { user: Partial<User> }) => {
  const pathname = usePathname();

  return (
    <header className="my-10 flex justify-between gap-5">
      <Link
        href="/"
        className="flex gap-2 items-center"
      >
        <Image
          src={"/icons/logo.svg"}
          width={40}
          height={40}
          alt={"logo"}
        />
        <span className="text-xl text-white font-semibold hidden xs:block">
          LibraryView
        </span>
      </Link>

      <ul className="flex flex-row items-center gap-4 sm:gap-6 md:gap-8 lg:gap-10 text-base md:text-lg lg:text-xl">
        <li>
          <Link
            className={cn(
              " hover:text-amber-200",
              pathname === "/" ? "text-amber-100" : "text-white"
            )}
            href="/"
          >
            Home
          </Link>
        </li>

        <li>
          <Link
            className={cn(
              " hover:text-amber-200",
              pathname === "/search" ? "text-amber-100" : "text-white"
            )}
            href="/search"
          >
            Search
          </Link>
        </li>

        {user.role === "ADMIN" ||
          (user.role === "TEST" && (
            <li>
              <Link
                className={cn(
                  " hover:text-amber-200 hidden md:block",
                  pathname === "/admin" ? "text-amber-100" : "text-white"
                )}
                href="/admin"
              >
                Admin Console
              </Link>
            </li>
          ))}
        <li className="lg:ml-4">
          <Link
            className="flex items-center gap-2"
            href={"/my-profile"}
          >
            <UserAvatar
              avatarUrl={user.avatar}
              fullName={user.fullName}
              className="size-6 md:size-8 lg:size-10"
            />
            <p className="text-white hidden md:block">
              {user?.fullName?.split(" ")[0]}
            </p>
          </Link>
        </li>
        <li>
          <form
            action={async () => {
              await signOutAction();
              redirect("/sign-in");
            }}
            className="flex items-center justify-start"
          >
            <button>
              <LogOut className="text-red-600 size-4 md:size-6 lg:size-8" />
            </button>
          </form>
        </li>
      </ul>
    </header>
  );
};

export default Header;
