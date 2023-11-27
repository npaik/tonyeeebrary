"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, eq } from "@/db";
import { posts as postsTable } from "@/db/schema/posts";
import { books as booksTable } from "@/db/schema/books";
import { covers as coversTable } from "@/db/schema/covers";
import { auth } from "@/auth";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";

// AWS S3 client credentials
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWSS3_ACCESS_KEY!,
    secretAccessKey: process.env.AWSS3_SECRET_ACCESS_KEY!,
  },
});

// file types and size restrictions
const acceptedFileTypes = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/epub+zip",
];
const maxFileSize = 1048576 * 100;

const generateFileName = (bytes = 32) =>
  crypto.randomBytes(bytes).toString("hex");

type SignedURLResponse = Promise<
  | { failure?: undefined; success: { url: string; id: number } }
  | { failure: string; success?: undefined }
>;

type GetSignedURLParams = {
  fileType: string;
  fileSize: number;
  checksum: string;
  fileCategory: "book" | "cover";
};

export const getSignedURL = async ({
  fileType,
  fileSize,
  checksum,
  fileCategory,
}: GetSignedURLParams): SignedURLResponse => {
  const session = await auth();

  if (!session) {
    return { failure: "not authenticated" };
  }

  if (!acceptedFileTypes.includes(fileType)) {
    return { failure: "File type not allowed" };
  }

  if (fileSize > maxFileSize) {
    return { failure: "File size too large" };
  }

  const fileName = generateFileName();

  const putObjectCommand = new PutObjectCommand({
    Bucket: process.env.AWS_BUCKET_NAME!,
    Key: fileName,
    ContentType: fileType,
    ContentLength: fileSize,
    ChecksumSHA256: checksum,
  });

  const url = await getSignedUrl(
    s3Client,
    putObjectCommand,
    { expiresIn: 60 } // 60 seconds
  );

  let results;

  if (fileCategory === "book") {
    results = await db
      .insert(booksTable)
      .values({ url: url.split("?")[0], userId: session.user.id })
      .returning();
  } else if (fileCategory === "cover") {
    results = await db
      .insert(coversTable)
      .values({ url: url.split("?")[0], userId: session.user.id })
      .returning();
  } else {
    return { failure: "Invalid file category" };
  }

  return { success: { url, id: results[0].id } };
};

export async function createPost({
  title,
  author,
  bookFileIds = [],
  coverFileIds = [],
}: {
  title: string;
  author: string;
  bookFileIds?: number[];
  coverFileIds?: number[];
}): Promise<{ failure: string } | undefined> {
  const session = await auth();

  if (!session) {
    return { failure: "not authenticated" };
  }

  if (title.length < 1) {
    return { failure: "enter title" };
  }

  const postResult = await db
    .insert(postsTable)
    .values({ title, author, userId: session.user.id })
    .returning();
  const postId = postResult[0].id;

  for (const fileId of coverFileIds) {
    await db
      .update(coversTable)
      .set({ postId })
      .where(eq(coversTable.id, fileId));
  }

  const coverId = coverFileIds.length > 0 ? coverFileIds[0] : null;

  for (const fileId of bookFileIds) {
    await db
      .update(booksTable)
      .set({
        postId,
        coverId,
      })
      .where(eq(booksTable.id, fileId));
  }

  revalidatePath("/");
  redirect("/");
}
