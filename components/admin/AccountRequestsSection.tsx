import React from "react";
import Link from "next/link";

import EmptyState from "./EmptyState";
import { Button } from "@/components/ui/button";
import UserAvatar from "../UserAvatar";

const AccountRequestsSection = ({
  recentAccountRequests,
}: {
  recentAccountRequests: User[];
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

      <div className="space-y-3">
        {recentAccountRequests.length > 0 ? (
          recentAccountRequests.map((request) => (
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
          ))
        ) : (
          <EmptyState
            title="No Pending Account Requests"
            description="There are currently no account requests awaiting approval."
          />
        )}
      </div>
    </section>
  );
};

export default AccountRequestsSection;
