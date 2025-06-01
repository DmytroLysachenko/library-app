import React from "react";
import Image from "next/image";
import { redirect } from "next/navigation";

import { auth } from "@/auth";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (session) return redirect("/");

  return (
    <main className="auth-container">
      <section className="auth-form">
        <div className="auth-box">
          <div className="flex flex-row gap-3">
            <Image
              src={"/icons/logo.svg"}
              width={37}
              height={37}
              alt="logo"
            />
            <h1 className="text-2xl font-semibold text-white">LibraryView</h1>
          </div>
          <div>{children}</div>{" "}
          <div className=" bg-dark-400 p-2 rounded-lg text-sm">
            <p>Test user with partial admin accesses</p>
            <p>
              Email: <strong>kawos77360@hartaria.com</strong>
            </p>
            <p>
              Password: <strong>kawos77360@hartaria.com</strong>
            </p>
          </div>
        </div>
      </section>

      <section className="auth-illustration">
        <Image
          src="/images/auth-illustration.png"
          alt="auth illustration"
          height={1000}
          width={1000}
          className="size-full object-cover"
        />
      </section>
    </main>
  );
};

export default Layout;
