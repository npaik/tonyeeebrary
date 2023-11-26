"use server"

import { db, eq } from "@/db"
import { posts as postsTable } from "@/db/schema/tables"
import { books as booksTable } from "@/db/schema/tables"
import { covers as coversTable } from "@/db/schema/tables"
import { revalidatePath } from "next/cache"

import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3"

// AWS S3 client credentials
const s3Client = new S3Client({
  region: process.env.AWS_BUCKET_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

async function deleteS3File(url: string) {
  const key = url.split("/").slice(-1)[0]
  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
  }
  await s3Client.send(new DeleteObjectCommand(deleteParams))
}

// Delete post from database and AWS S3
export async function deletePost(postId: number) {
  try {
    // Get all books and covers associated with the post
    const booksToDelete = await db.select().from(booksTable).where(eq(booksTable.postId, postId))
    const coversToDelete = await db.select().from(coversTable).where(eq(coversTable.postId, postId))

    // Delete the books and covers from the database
    await db.delete(booksTable).where(eq(booksTable.postId, postId))
    await db.delete(coversTable).where(eq(coversTable.postId, postId))

    // Delete the post itself
    await db.delete(postsTable).where(eq(postsTable.id, postId))

    // Delete associated files from AWS S3
    for (const book of booksToDelete) {
      await deleteS3File(book.url)
    }
    for (const cover of coversToDelete) {
      await deleteS3File(cover.url)
    }

    // Revalidate path if needed
    revalidatePath("/")
  } catch (e) {
    console.error("Error deleting post:", e)
    throw e // Rethrow the error after logging it
  }
}
