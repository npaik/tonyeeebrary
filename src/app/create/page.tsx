import CreatePostForm from "@/app/create/create-post-form"

import { auth } from "@/auth"

import { redirect } from "next/navigation"

export default async function Create() {
  const session = await auth()
  if (!session?.user) {
    redirect("/api/auth/signin?callbackUrl=/")
  }

  return (
    <div className="pt-8">
      <CreatePostForm user={session.user} />
    </div>
  )
}
