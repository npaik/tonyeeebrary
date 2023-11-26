import { userPostsQuery } from "@/db/queries/postsFeed"

import Profile from "./profile"

import { auth, signOut } from "@/auth"

import { redirect } from "next/navigation"

export default async function ProfilePage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/me")
  }

  const posts = await userPostsQuery.execute({ userId: session.user.id })
  console.log(posts.length)
  const numberOfBooks = posts.length
  return (
    <>
      <div className="pt-8">
        <Profile user={session.user} bookCount={numberOfBooks} />
      </div>
    </>
  )
}
