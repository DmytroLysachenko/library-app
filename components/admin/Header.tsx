import React from "react";

import SearchInput from "../SearchInput";

const Header = async ({ user }: { user: Partial<User> }) => {
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
      <SearchInput
        variant="admin"
        placeholder="Search users, books by title, author, or genre..."
      />
    </header>
  );
};

export default Header;
