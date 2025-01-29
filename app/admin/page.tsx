import { books, borrowRecords, users } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db/drizzle";

import BarrowRequestsSection from "@/components/admin/BorrowRecordsSection";
import RecentlyAddedBooksSection from "@/components/admin/RecentlyAddedBooksSection";
import AccountRequestsSection from "@/components/admin/AccountRequestsSection";
import StatisticsBoard from "@/components/admin/StatisticsBoard";

const Page = async () => {
  const recentBooks = (await db
    .select()
    .from(books)
    .limit(6)
    .orderBy(desc(books.createdAt))) as Book[];

  const recentBorrowRecords = (await db
    .select()
    .from(borrowRecords)
    .where(eq(borrowRecords.status, "BORROWED"))
    .leftJoin(books, eq(borrowRecords.bookId, books.id))
    .leftJoin(users, eq(borrowRecords.userId, users.id))
    .orderBy(desc(borrowRecords.createdAt))
    .limit(3)
    .then((res) => {
      return res.map((record) => ({
        ...record.borrow_records,
        book: { ...record.books },
        user: { ...record.users },
      }));
    })) as BorrowRecord[];

  return (
    <div className="admin-container">
      <StatisticsBoard />

      <div className="grid grid-cols-2 grid-rows-2 gap-12">
        <BarrowRequestsSection requests={recentBorrowRecords} />

        <RecentlyAddedBooksSection recentBooks={recentBooks} />

        <AccountRequestsSection />
      </div>
    </div>
  );
};

export default Page;
