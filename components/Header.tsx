"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

const Header = () => {
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
              "text-base cursor-pointer capitalize",
              pathname === "/library" ? "text-light-200" : "text-light-100"
            )}
            href="/library"
          >
            Library
          </Link>
        </li>
      </ul>
    </header>
  );
};

export default Header;
