import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { desc } from "drizzle-orm";

const Home = async () => {
  const session = await auth();

  const latestBooks = (await db
    .select()
    .from(books)
    .limit(6)
    .orderBy(desc(books.createdAt))) as Book[];

  return (
    <>
      <BookOverview
        {...latestBooks[0]}
        userId={session?.user?.id as string}
      />
      {latestBooks.length >= 2 && (
        <BookList
          title="Latest Books"
          books={latestBooks.slice(1)}
        />
      )}
    </>
  );
};

export default Home;
