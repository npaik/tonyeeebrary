import FeedPost from "@/app/feed/feed-post"

import { postsFeedQuery } from "@/db/queries/postsFeed"

export default async function Home() {
  const posts = await postsFeedQuery.execute()

  return (
    <div className="col-span-1 overflow-hidden rounded-lg">
      {posts.map((post) => (
        <FeedPost key={post.id} post={post} />
      ))}
    </div>
  )
}
