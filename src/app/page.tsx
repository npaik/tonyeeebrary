import FeedPost from "@/app/feed/feed-post"
import { postsFeedQuery } from "@/db/queries/postsFeed"
import Link from "next/link"

import { auth, signOut } from "@/auth"
import SignoutButton from "@/components/sign-out-button"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"

import { Suspense } from "react"
import Loading from "./loading"

export default async function home() {
  revalidatePath("/")
  const session = await auth()
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/")
  }

  const posts = await postsFeedQuery.execute()

  return (
    <>
      <Suspense fallback={<Loading />}></Suspense>
      <div className="container mx-auto pt-2">
        <div className="grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {posts.map((post) => (
            <FeedPost key={post.id} post={post} />
          ))}
        </div>
      </div>
    </>
  )
}
