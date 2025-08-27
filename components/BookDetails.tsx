import React from "react";

import BookVideo from "./BookVideo";

const BookDetails = async ({
  bookDetailsPromise,
}: {
  bookDetailsPromise: Promise<{ summary: string; videoUrl: string }>;
}) => {
  const bookDetails = await bookDetailsPromise;

  return (
    <>
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
    </>
  );
};

export default BookDetails;
