import { auth } from "@/auth";
import { redirect } from "next/navigation";
import React from "react";

import "@/styles/admin.css";
import Sidebar from "@/components/admin/Sidebar";
import Header from "@/components/admin/Header";
import { db } from "@/db/drizzle";
import { eq } from "drizzle-orm";
import { users } from "@/db/schema";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const session = await auth();

  if (!session?.user?.id) redirect("/sign-in");

  const user = (await db
    .select({
      role: users.role,
      avatar: users.avatar,
      fullName: users.fullName,
      email: users.email,
    })
    .from(users)
    .where(eq(users.id, session?.user!.id!))
    .limit(1)
    .then((res) => res[0])) as Partial<User>;

  if (user.role !== "ADMIN") redirect("/");

  return (
    <main className="flex min-h-screen w-full flex-row">
      <Sidebar user={user} />
      <div className="admin-container">
        <Header user={user} />
        {children}
      </div>
    </main>
  );
};

export default Layout;
