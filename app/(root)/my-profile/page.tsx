import { signOut } from "@/auth";
import BookList from "@/components/BookList";
import { Button } from "@/components/ui/button";
import { sampleBooks } from "@/constants";
import { db } from "@/db/drizzle";
import React from "react";

const page = async () => {
  return (
    <>
      {/* <BookList
        title="Borrowed Books"
        books={sampleBooks}
      /> */}
    </>
  );
};

export default page;
