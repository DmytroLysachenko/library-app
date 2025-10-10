import React from "react";

import SearchInput from "./SearchInput";

const SearchSection = () => {
  return (
    <section className="library " data-testid="search-section">
      <p className="library-subtitle tracking-widest" data-testid="search-subtitle">
        Discover Your Next Great Read:
      </p>
      <h1 className="library-title" data-testid="search-title">
        Explore and Search for <br />{" "}
        <span className="font-semibold text-light-200">Any Book</span> In Our
        Library
      </h1>

      <SearchInput />
    </section>
  );
};

export default SearchSection;
