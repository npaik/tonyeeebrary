import React from "react"
import EPubReader from "@/components/epubReader"
import { db, eq } from "@/db"
import { books as booksTable } from "@/db/schema/tables"
import { covers as coversTable } from "@/db/schema/tables"

export default async function BookPage({ params }: { params: { id: string } }) {
  const bookId = +params.id
  if (!params.id) {
    return <div>Book not found</div>
  }

  const bookData = await db
    .select()
    .from(booksTable)
    .where(eq(booksTable.id, bookId))
    .then((result) => result[0])

  console.log("S3 Book data", bookData.url)
  if (!bookData) {
    return <div>Book not found</div>
  }

  const coverId = bookData.coverId

  let coverImage
  if (coverId !== null) {
    coverImage = await db
      .select()
      .from(coversTable)
      .where(eq(coversTable.id, coverId))
      .then((result) => result[0])
  }
  // console.log(coverImage?.url)

  return <EPubReader bookUrl={bookData.url} />
}
