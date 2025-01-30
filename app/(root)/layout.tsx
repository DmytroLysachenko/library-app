import React from "react";
import { redirect } from "next/navigation";
import { after } from "next/server";
import { eq } from "drizzle-orm";

import { auth } from "@/auth";
import Header from "@/components/Header";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const Layout = async ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const session = await auth();

  if (!session) return redirect("/sign-in");

  const user = await db
    .select({
      avatar: users.avatar,
      fullName: users.fullName,
      role: users.role,
    })
    .from(users)
    .where(eq(users.id, session?.user?.id as string))
    .limit(1)
    .then((res) => res[0]);

  after(async () => {
    if (!session.user?.id) return;

    const user = await db
      .select({ lastActivityDate: users.lastActivityDate })
      .from(users)
      .where(eq(users.id, session?.user!.id!))
      .limit(1)
      .then((res) => res[0]);

    if (user.lastActivityDate === new Date().toISOString().slice(0, 10)) return;

    await db
      .update(users)
      .set({ lastActivityDate: new Date().toISOString().slice(0, 10) })
      .where(eq(users.id, session.user.id));
  });

  return (
    <main className="root-container">
      <div className="mx-auto w-full max-w-7xl">
        <Header user={user} />
        <div className="mt-20 pb-20">{children}</div>
      </div>
    </main>
  );
};

export default Layout;
