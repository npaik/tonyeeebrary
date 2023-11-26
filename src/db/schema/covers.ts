import { serial, text, integer, pgTable, pgEnum, timestamp } from "drizzle-orm/pg-core"

import { users } from "./tables"
import { posts } from "./posts"

export const covers = pgTable("covers", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  postId: integer("post_id").references(() => posts.id),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
