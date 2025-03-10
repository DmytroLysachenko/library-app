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
      <Link href="/">
        <Image
          src={"/images/logo.png"}
          width={200}
          height={100}
          alt={"logo"}
        />
      </Link>
      <ul className="flex flex-row items-center gap-8">
        <li>
          <Link
            className={cn(
              "text-xl hover:text-amber-200",
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
              "text-xl hover:text-amber-200",
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
                  "text-xl hover:text-amber-200",
                  pathname === "/admin" ? "text-amber-100" : "text-white"
                )}
                href="/admin"
              >
                Admin Console
              </Link>
            </li>
          ))}
        <li>
          <Link
            className="flex items-center gap-2"
            href={"/my-profile"}
          >
            <UserAvatar
              avatarUrl={user.avatar}
              fullName={user.fullName}
            />
            <p className="text-white">{user?.fullName?.split(" ")[0]}</p>
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
              <LogOut className="text-red-600" />
            </button>
          </form>
        </li>
      </ul>
    </header>
  );
};

export default Header;
