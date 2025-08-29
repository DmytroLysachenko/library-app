"use server";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

import config from "../config";

const {
  amazon: { accessKeyId, secretAccessKey, region, bucketName },
} = config.env;

const s3Client = new S3Client({
  region,
  credentials: {
    accessKeyId,
    secretAccessKey,
  },
});

export const uploadToS3 = async (
  fileBuffer: Buffer,
  fileName: string,
  contentType: string
) => {
  const params = {
    Bucket: bucketName,
    Key: fileName,
    Body: fileBuffer,
    ContentType: contentType,
  };

  const command = new PutObjectCommand(params);
  await s3Client.send(command);

  return `https://${params.Bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${params.Key}`;
};
