import React from "react";

const StatCard = ({
  label,
  count,
  change,
  changeType = "positive",
}: {
  label: string;
  count: number;
  change: number;
  changeType?: "positive" | "negative";
}) => {
  return (
    <div className="stat">
      <div className="stat-info">
        <p className="stat-label">{label}</p>
        <p
          className={`text-sm font-medium ${changeType === "positive" ? "text-green-500" : "text-red-500"}`}
        >
          {changeType === "positive" ? "+" : "-"} {Math.abs(change)}
        </p>
      </div>
      <p className="stat-count">{count}</p>
    </div>
  );
};

const StatisticsBoard = () => {
  return (
    <section className="grid grid-cols-3 gap-5 mb-10">
      <StatCard
        label="Barrowed Books"
        count={145}
        change={-2}
        changeType="negative"
      />
      <StatCard
        label="Total Users"
        count={317}
        change={4}
        changeType="positive"
      />
      <StatCard
        label="Total Books"
        count={163}
        change={2}
        changeType="positive"
      />
    </section>
  );
};

export default StatisticsBoard;
