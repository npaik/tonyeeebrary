import { serial, text, timestamp, integer, pgTable, AnyPgColumn } from "drizzle-orm/pg-core"
import { users } from "./tables"

export const posts = pgTable("posts", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id),
  title: text("title").notNull(),
  author: text("author").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
})
