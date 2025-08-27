import React, { Suspense } from "react";
import Link from "next/link";

import EmptyState from "./EmptyState";
import { Button } from "@/components/ui/button";
import UserAvatar from "../UserAvatar";
import EntryLoadingSkeleton from "./EntryLoadingSkeleton";

const AccountRequestsSection = async ({
  accountRequestsPromise,
}: {
  accountRequestsPromise: Promise<User[]>;
}) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-dark-400">
          Account Requests
        </h2>
        <Button
          variant="link"
          className="view-btn px-0"
        >
          <Link href={"/admin/account-requests"}>View all</Link>
        </Button>
      </div>
      <Suspense fallback={<EntryLoadingSkeleton />}>
        <AccountRequestsEntries
          accountRequestsPromise={accountRequestsPromise}
        />
      </Suspense>
    </section>
  );
};

const AccountRequestsEntries = async ({
  accountRequestsPromise,
}: {
  accountRequestsPromise: Promise<User[]>;
}) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  const recentAccountRequests = await accountRequestsPromise;
  return (
    <>
      {recentAccountRequests.length > 0 ? (
        <div className="space-y-3 grid grid-cols-3">
          {recentAccountRequests.map((request) => (
            <div
              key={request.id}
              className="user-card"
            >
              <UserAvatar
                avatarUrl={request.avatar}
                fullName={request.fullName}
              />
              <p className="name">{request.fullName}</p>
              <p className="email">{request.email}</p>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="No Pending Account Requests"
          description="There are currently no account requests awaiting approval."
        />
      )}
    </>
  );
};

export default AccountRequestsSection;
