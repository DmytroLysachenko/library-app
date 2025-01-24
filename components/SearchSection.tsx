import React from "react";

import SearchInput from "./SearchInput";

const SearchSection = () => {
  return (
    <section className="library ">
      <p className="library-subtitle tracking-widest">
        Discover Your Next Great Read:
      </p>
      <h1 className="library-title">
        Explore and Search for <br />{" "}
        <span className="font-semibold text-light-200">Any Book</span> In Our
        Library
      </h1>

      <SearchInput />
    </section>
  );
};

export default SearchSection;
