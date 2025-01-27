import UsersTable from "@/components/admin/UsersTable";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import React from "react";

const Page = async () => {
  const allUsers = (await db.select().from(users)) as User[];

  console.log(allUsers);

  return (
    <section className="w-full rounded-2xl bg-white p-7">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Users</h2>
      </div>
      <UsersTable users={allUsers} />
    </section>
  );
};

export default Page;
