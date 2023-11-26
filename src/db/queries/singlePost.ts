import { db, eq, sql } from "@/db"

import { posts as postsTable } from "@/db/schema/tables"
import { users as usersTable } from "@/db/schema/tables"
import { books as booksTable } from "@/db/schema/tables"
import { covers as coversTable } from "@/db/schema/tables"

export const singlePostQuery = db
  .select({
    id: postsTable.id,
    title: postsTable.title,
    author: postsTable.author,
    createdAt: postsTable.createdAt,
    user: {
      id: usersTable.id,
      name: usersTable.name,
      image: usersTable.image,
    },
    books: {
      id: booksTable.id,
      url: booksTable.url,
    },
  })
  .from(postsTable)
  .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
  .leftJoin(booksTable, eq(booksTable.postId, postsTable.id))
  .where(eq(postsTable.id, sql.placeholder("id")))
  .limit(1)
  .prepare("single_post")

export type Post = Awaited<ReturnType<typeof singlePostQuery.execute>>[0]
