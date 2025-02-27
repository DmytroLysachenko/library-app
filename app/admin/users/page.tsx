import React from "react";
import { and, asc, count, desc, eq, ilike } from "drizzle-orm";

import SortSelector from "@/components/SortSelector";
import UsersTable from "@/components/admin/UsersTable";
import { db } from "@/db/drizzle";
import { users } from "@/db/schema";
import { alphabeticalSortOptions, userStatusSortOptions } from "@/constants";
import { User2 } from "lucide-react";
import { getUsersFilterValue } from "@/lib/utils";
import ListPagination from "@/components/ListPagination";

const Page = async ({
  searchParams,
}: {
  searchParams: Promise<{
    page: string;
    sort: string;
    query: string;
    status: string;
  }>;
}) => {
  const { sort, query, status, page = 1 } = await searchParams;
  const perPage = 8;

  const [allUsers, totalCountResults] = await Promise.all([
    db
      .select()
      .from(users)
      .where(
        and(
          status ? eq(users.status, getUsersFilterValue(status)) : undefined,
          query ? ilike(users.fullName, `%${query}%`) : undefined
        )
      )
      .orderBy(sort === "asc" ? asc(users.fullName) : desc(users.fullName))
      .limit(perPage)
      .offset((Number(page) - 1) * perPage) as Promise<User[]>,
    db
      .select({ count: count() })
      .from(users)
      .where(
        and(
          status ? eq(users.status, getUsersFilterValue(status)) : undefined,
          query ? ilike(users.fullName, `%${query}%`) : undefined
        )
      )
      .limit(1)
      .then((res) => res[0].count),
  ]);

  return (
    <section className="admin-container">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-xl font-semibold"> All Users</h2>

        <div className="flex flex-row items-center gap-4">
          <SortSelector
            options={userStatusSortOptions}
            param="status"
            variant="admin"
            placeholder="User status"
            placeholderIcon={<User2 className="mr-2 h-4 w-4" />}
          />

          <SortSelector
            options={alphabeticalSortOptions}
            param="sort"
            variant="admin"
          />
        </div>
      </div>

      <UsersTable
        users={allUsers}
        type="users"
      />

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
