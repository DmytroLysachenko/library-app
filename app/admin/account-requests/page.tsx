import React from "react";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";

import SortSelector from "@/components/SortSelector";
import UsersTable from "@/components/admin/UsersTable";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { dateSortOptions } from "@/constants";
import ListPagination from "@/components/ListPagination";
import EmptyState from "@/components/admin/EmptyState";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{ page: string; sort: "asc" | "desc"; query: string }>;
}) => {
  const { sort, query, page = 1 } = await searchParams;
  const perPage = 8;

  const [allUsers, totalCountResults] = await Promise.all([
    db
      .select()
      .from(users)
      .orderBy(sort === "asc" ? asc(users.createdAt) : desc(users.createdAt))
      .where(
        and(
          eq(users.status, "PENDING"),
          query ? ilike(users.fullName, `%${query}%`) : undefined
        )
      )
      .limit(perPage)
      .offset((Number(page) - 1) * perPage) as Promise<User[]>,
    db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          eq(users.status, "PENDING"),
          query ? ilike(users.fullName, `%${query}%`) : undefined
        )
      )
      .limit(1)
      .then((res) => res[0].count),
  ]);

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All pending account requests</h2>

        <SortSelector
          options={dateSortOptions}
          param="sort"
          variant="admin"
        />
      </div>

      <UsersTable
        users={allUsers}
        type="requests"
      />

      {allUsers.length === 0 && (
        <EmptyState
          title="No Pending Account Requests"
          description="There are currently no account requests awaiting approval."
        />
      )}

      {Number(page) <= Math.ceil(totalCountResults / perPage) && (
        <ListPagination
          currentPage={Number(page)}
          lastPage={Math.ceil(totalCountResults / perPage)}
          variant="admin"
        />
      )}
    </section>
  );
};

export default Page;
