import { serial, text, integer, pgTable, pgEnum, timestamp } from "drizzle-orm/pg-core"

import { users } from "./tables"
import { posts } from "./posts"
import { covers } from "./covers"

export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  coverId: integer("cover_id").references(() => covers.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
