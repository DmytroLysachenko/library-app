import React from "react";
import { asc, desc } from "drizzle-orm";

import SortSelector from "@/components/admin/SortSelector";
import UsersTable from "@/components/admin/UsersTable";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: "asc" | "desc" }>;
}) => {
  const { page = 1, sort } = await searchParams;

  const allUsers = (await db
    .select()
    .from(users)
    .orderBy(
      sort === "asc" ? asc(users.fullName) : desc(users.fullName)
    )) as User[];

  console.log(allUsers);

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Users</h2>
        <SortSelector type="alphabetical" />
      </div>
      <UsersTable
        users={allUsers}
        type="users"
      />
    </section>
  );
};

export default Page;
