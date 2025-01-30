import React from "react";
import { asc, desc, eq } from "drizzle-orm";

import SortSelector from "@/components/admin/SortSelector";
import UsersTable from "@/components/admin/UsersTable";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: "asc" | "desc" }>;
}) => {
  const { sort } = await searchParams;

  const allUsers = (await db
    .select()
    .from(users)
    .orderBy(sort === "asc" ? asc(users.createdAt) : desc(users.createdAt))
    .where(eq(users.status, "PENDING"))) as User[];

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All pending account requests</h2>
        <SortSelector type="date" />
      </div>
      <UsersTable
        users={allUsers}
        type="requests"
      />
    </section>
  );
};

export default Page;
