"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import config from "../config";

type AmazonConfig = {
  accessKeyId: string;
  secretAccessKey: string;
  region: string;
  bucketName: string;
};

let cachedConfig: AmazonConfig | null = null;
let cachedClient: S3Client | null = null;

const getAmazonConfig = (): AmazonConfig => {
  if (cachedConfig) {
    return cachedConfig;
  }

  const amazon = config?.env?.amazon;

  if (
    !amazon ||
    !amazon.accessKeyId ||
    !amazon.secretAccessKey ||
    !amazon.region ||
    !amazon.bucketName
  ) {
    throw new Error("Amazon S3 environment variables are not fully configured.");
  }

  cachedConfig = {
    accessKeyId: amazon.accessKeyId,
    secretAccessKey: amazon.secretAccessKey,
    region: amazon.region,
    bucketName: amazon.bucketName,
  };

  return cachedConfig;
};

const getS3Client = () => {
  if (cachedClient) {
    return cachedClient;
  }

  const { region, accessKeyId, secretAccessKey } = getAmazonConfig();

  cachedClient = new S3Client({
    region,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return cachedClient;
};

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
) => {
  const { bucketName, region } = getAmazonConfig();
  const s3Client = getS3Client();

  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${bucketName}.s3.${region}.amazonaws.com/${params.Key}`;
};
