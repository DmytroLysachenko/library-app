import { auth } from "@/auth";
import BookList from "@/components/BookList";
import BookOverview from "@/components/BookOverview";
import BookVideo from "@/components/BookVideo";
import { db } from "@/db/drizzle";
import { books } from "@/db/schema";
import { desc, eq, not } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();

  const [bookDetails] = await db
    .select()
    .from(books)
    .where(eq(books.id, id))
    .limit(1);

  if (!bookDetails) redirect("/404");

  const latestBooks = (await db
    .select()
    .from(books)
    .limit(6)
    .where(not(eq(books.id, id)))
    .orderBy(desc(books.createdAt))) as Book[];

  return (
    <>
      <BookOverview
        {...bookDetails}
        userId={session?.user?.id as string}
      />
      <div className="book-details">
        <div className="flex-[1.5]">
          <section className="flex flex-col gap-7">
            <h3>Video</h3>
            <BookVideo videoUrl={bookDetails.videoUrl} />
          </section>
          <section className="mt-10 flex flex-col gap-7">
            <h3>Summary</h3>
            <div className="space-y-5 text-xl text-light-100">
              {bookDetails.summary.split("\n").map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
          <BookList
            title="Latest Books"
            books={latestBooks}
            containerClassName="mt-20"
          />
        </div>
      </div>
    </>
  );
};

export default Page;
