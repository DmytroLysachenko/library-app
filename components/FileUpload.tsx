"use client";

import React, { useRef, useState } from "react";
import Image from "next/image";

import { IKImage, ImageKitProvider, IKUpload, IKVideo } from "imagekitio-next";
import config from "@/lib/config";
import { toast } from "@/lib/actions/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  IKUploadResponse,
  UploadError,
} from "imagekitio-next/dist/types/components/IKUpload/props";

interface FileUploadProps {
  type: "image" | "video";
  accept: string;
  placeholder: string;
  folder: string;
  variant: "dark" | "light";
  onFileChange: (filePath: string) => void;
  value?: string;
  size?: number;
}

const {
  env: {
    imagekit: { publicKey, urlEndpoint },
  },
} = config;

const authenticator = async () => {
  try {
    const response = await fetch(`${config.env.baseUrl}/api/imagekit`);

    if (!response.ok) {
      const errorText = await response.text();

      throw new Error(
        `Request failed with status ${response.status}: ${errorText}`
      );
    }

    const data = (await response.json()) as {
      signature: string;
      expire: number;
      token: string;
    };

    const { signature, expire, token } = data;

    return { token, expire, signature };
  } catch (error: unknown) {
    throw new Error(`Authentication request failed: ${error}`);
  }
};

const FileUpload = ({
  onFileChange,
  type,
  accept,
  placeholder,
  folder,
  variant,
  value,
  size = 600,
}: FileUploadProps) => {
  const ikUploadRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<{ filePath: string | null }>({
    filePath: value ?? null,
  });

  const styles = {
    button:
      variant === "dark"
        ? "bg-dark-300"
        : "bg-light-600 border-gray-100 border",
    placeholder: variant === "dark" ? "text-light-100" : "text-slate-500",
    text: variant === "dark" ? "text-light-100" : "text-dark-400",
  };

  const onError = (error: UploadError) => {
    console.log(error);
    toast({
      title: `${type} upload failed`,
      description: `Your ${type} could not be uploaded. Please try again.`,
      variant: "destructive",
    });
  };

  const onSuccess = (response: IKUploadResponse) => {
    setFile(response);
    onFileChange(response.filePath);
    toast({
      title: `${type} uploaded successfully`,
      description: `${response.filePath} uploaded`,
    });
  };

  const onValidate = (file: File) => {
    if (type === "image") {
      if (file.size > 20 * 1024 * 1024) {
        toast({
          title: `File size is too large`,
          description: `Please upload a file up to 20MB in size.`,
          variant: "destructive",
        });
        return false;
      }
    } else if (type === "video") {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: `File size is too large`,
          description: `Please upload a file up to 50MB in size.`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  return (
    <ImageKitProvider
      publicKey={publicKey}
      urlEndpoint={urlEndpoint}
      authenticator={authenticator}
    >
      <IKUpload
        className="hidden"
        ref={ikUploadRef}
        onError={onError}
        onSuccess={onSuccess}
        useUniqueFileName={true}
        validateFile={onValidate}
        onUploadStart={() => setProgress(0)}
        onUploadProgress={({ loaded, total }) => {
          const percent = Math.floor((loaded / total) * 100);
          setProgress(percent);
        }}
        folder={folder}
        accept={accept}
      />
      <button
        className={cn("upload-btn", styles.button)}
        onClick={(e) => {
          e.preventDefault();

          if (ikUploadRef.current) {
            // @ts-expect-error To avoid redeclaring types from never
            ikUploadRef.current?.click();
          }
        }}
      >
        <Image
          src="/icons/upload.svg"
          alt="upload-icon"
          width={20}
          height={20}
          className="object-contain"
        />
        <p className={cn("text-base", styles.placeholder)}>{placeholder}</p>
      </button>

      {progress > 0 && progress !== 100 && (
        <div className="w-full rounded-full bg-green-200">
          <div
            className="progress"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      {file.filePath &&
        (type === "image" ? (
          <IKImage
            alt={file.filePath || "image preview"}
            path={file.filePath ?? undefined}
            width={size}
            height={size}
            className="object-contain"
          />
        ) : type === "video" ? (
          <IKVideo
            path={file.filePath ?? undefined}
            controls={true}
            className="h-96 w-full rounded-xl"
          />
        ) : null)}
    </ImageKitProvider>
  );
};

export default FileUpload;
