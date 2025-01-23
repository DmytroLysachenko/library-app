"use client";

import config from "@/lib/config";
import { IKVideo, ImageKitProvider } from "imagekitio-next";
import React from "react";

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
