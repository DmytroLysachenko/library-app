import React from "react";
import { Button } from "../ui/button";
import EmptyState from "./EmptyState";
import Link from "next/link";

const AccountRequestsSection = () => {
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
        <EmptyState
          title="No Pending Account Requests"
          description="There are currently no account requests awaiting approval."
        />
      </div>
    </section>
  );
};

export default AccountRequestsSection;
