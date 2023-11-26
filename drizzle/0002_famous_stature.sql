ALTER TABLE "posts" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" ADD COLUMN "author" text NOT NULL;--> statement-breakpoint
ALTER TABLE "posts" DROP COLUMN IF EXISTS "content";