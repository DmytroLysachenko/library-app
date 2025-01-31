import React from "react";
import Link from "next/link";
import dayjs from "dayjs";

import EmptyState from "./EmptyState";
import { Button } from "../ui/button";
import UserAvatar from "../UserAvatar";
import BookCover from "../BookCover";

const BorrowRecordsSection = ({ requests }: { requests: BorrowRecord[] }) => {
  return (
    <section>
      <div className="flex justify-between items-center mb-5">
        <h2 className="text-xl font-semibold text-dark-400">
          Recent Borrow Records
        </h2>
        <Button
          variant="link"
          className="view-btn px-0"
          asChild
        >
          <Link href={"/admin/borrow-records"}>View all</Link>
        </Button>
      </div>

      <div className="space-y-3">
        {requests.length > 0 ? (
          requests.map((request) => (
            <div
              key={request.id}
              className="book-stripe"
            >
              <BookCover
                coverUrl={request.book.coverUrl}
                variant="small"
              />
              <div className="flex-1">
                <h3 className="title">{request.book.title}</h3>
                <div className="author">
                  <p>By {request.book.author}</p>
                  <div />
                  <p>{request.book.genre}</p>
                </div>
                <div className="user">
                  <div className="avatar">
                    <UserAvatar
                      avatarUrl={request.user.avatar}
                      fullName={request.user.fullName}
                      className="w-4 h-4"
                    />
                    <p>{request.user.fullName}</p>
                  </div>
                  <div className="borrow-date">
                    <p>{dayjs(request.createdAt).format("DD/MM/YY")} </p>
                  </div>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="No Pending Borrow Records"
            description="There are no borrow book requests awaiting your review at this time."
          />
        )}
      </div>
    </section>
  );
};

export default BorrowRecordsSection;
