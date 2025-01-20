import React from "react";

const Page = () => {
  return (
    <main className="root-container flex min-h-screen flex-col items-center justify-center">
      <h1 className="font-bebas-neue text-5xl font-bold text-light-100">
        Too many requests, slow down.
      </h1>
      <p className="mt-3 max-2-xl text-center text-light-400">
        Looks like you've been making a lot of requests recently! To keep things
        running smoothly for everyone, we have a temporary limit in place.
        Please try again in a few minutes.
      </p>
    </main>
  );
};

export default Page;
