import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import React from "react";
// import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Session } from "next-auth";
import { signOut } from "@/auth";
import { Button } from "./ui/button";

const Header = ({ session }: { session: Session }) => {
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
          <form
            action={async () => {
              "use server";
              await signOut();
            }}
            className="mb-10"
          >
            <Button>Logout</Button>
          </form>
          {/* <Link href={"/my-profile"}>
            <Avatar>
              <AvatarFallback className="bg-amber-100">
                {getInitials(session?.user?.name || "IN")}
              </AvatarFallback>
            </Avatar>
          </Link> */}
        </li>
      </ul>
    </header>
  );
};

export default Header;
