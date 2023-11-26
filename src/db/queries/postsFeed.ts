import { db, eq, sql, desc } from "@/db"

import { posts as postsTable } from "@/db/schema/tables"
import { users as usersTable } from "@/db/schema/tables"
import { books as booksTable } from "@/db/schema/tables"
import { covers as coversTable } from "@/db/schema/tables"

const baseQuery = db
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
      coverId: booksTable.coverId,
    },
    covers: {
      id: coversTable.id,
      url: coversTable.url,
    },
  })
  .from(postsTable)
  .innerJoin(usersTable, eq(usersTable.id, postsTable.userId))
  .leftJoin(booksTable, eq(booksTable.postId, postsTable.id))
  .leftJoin(coversTable, eq(coversTable.postId, postsTable.id))

export const postsFeedQuery = baseQuery.orderBy(desc(postsTable.createdAt)).prepare("posts_for_feed")

export const userPostsQuery = baseQuery
  .where(eq(usersTable.id, sql.placeholder("userId")))
  .orderBy(desc(postsTable.createdAt))
  .prepare("posts_for_user_feed")

export type Post = Awaited<ReturnType<typeof postsFeedQuery.execute>>[0]
