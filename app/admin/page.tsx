import { desc, eq, ne } from "drizzle-orm";

import { db } from "@/db/drizzle";
import { books, borrowRecords, users } from "@/db/schema";
import BorrowRequestsSection from "@/components/admin/BorrowRequestsSection";
import AddedBooksSection from "@/components/admin/AddedBooksSection";
import AccountRequestsSection from "@/components/admin/AccountRequestsSection";
import StatisticsBoard from "@/components/admin/StatisticsBoard";

const Page = () => {
  const booksPromise = db
    .select()
    .from(books)
    .limit(6)
    .orderBy(desc(books.createdAt));

  const borrowRequestsPromise = db
    .select()
    .from(borrowRecords)
    .where(ne(borrowRecords.status, "RETURNED"))
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .leftJoin(users, eq(borrowRecords.userId, users.id))
    .orderBy(desc(borrowRecords.createdAt))
    .limit(3)
    .then((res) => {
      return res.map((record) => ({
        ...record.borrow_records!,
        book: { ...record.books! },
        user: { ...record.users! },
      }));
    }) as Promise<BorrowRecord[]>;

  const accountRequestsPromise = db
    .select()
    .from(users)
    .orderBy(desc(users.createdAt))
    .where(eq(users.status, "PENDING"))
    .limit(6) as Promise<User[]>;

  return (
    <div className="admin-container">
      <StatisticsBoard />

      <div className="grid grid-cols-2 grid-rows-2 gap-12">
        <BorrowRequestsSection borrowRequestsPromise={borrowRequestsPromise} />

        <AddedBooksSection booksPromise={booksPromise} />

        <AccountRequestsSection
          accountRequestsPromise={accountRequestsPromise}
        />
      </div>
    </div>
  );
};

export default Page;
