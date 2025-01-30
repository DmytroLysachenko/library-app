import React from "react";
import { AutoRecorderIndicator } from "./AutoRecorderIndicator";
import { db } from "@/db/drizzle";
import { appStatsRecords } from "@/db/schema";
import { desc } from "drizzle-orm";

const Header = async ({ user }: { user: Partial<User> }) => {
  const lastStatRecordStatus = await db
    .select()
    .from(appStatsRecords)
    .orderBy(desc(appStatsRecords.createdAt))
    .limit(1)
    .then((res) => (res.length ? res[0].statsRecordingStatus : false));

  return (
    <header className="admin-header">
      <div>
        <h2 className="text-2xl font-semibold text-dark-400">
          {user?.fullName}
        </h2>
        <p className="text-slate-500 text-base">
          Monitor all of your users and books here
        </p>
      </div>
      <AutoRecorderIndicator status={lastStatRecordStatus} />
    </header>
  );
};

export default Header;
