"use client";

import React from "react";
import { IKVideo, ImageKitProvider } from "imagekitio-next";

import config from "@/lib/config";

const BookVideo = ({ videoUrl }: { videoUrl: string }) => {
  return (
    <ImageKitProvider
      publicKey={config.env.imagekit.publicKey}
      urlEndpoint={config.env.imagekit.urlEndpoint}
    >
      <IKVideo
        width={"100%"}
        path={videoUrl}
        controls={true}
        className="w-full rounded-xl max-h-[500px]"
      />
    </ImageKitProvider>
  );
};

export default BookVideo;
