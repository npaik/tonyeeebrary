import Image from "next/image"
import Link from "next/link"

export default function Profile({
  user,
  bookCount,
}: {
  user: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  bookCount: number
}) {
  return (
    <div className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl mx-auto bg-white rounded-lg shadow-xl p-8">
      <div className="flex flex-col items-center">
        <Link className="rounded-full h-32 w-32 overflow-hidden relative mb-6" href="/me">
          <Image
            className="object-cover"
            src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
            alt={user.name || "user profile image"}
            layout="fill"
          />
        </Link>
        <h2 className="text-4xl font-bold mb-4 mt-4">{user.name}</h2>
        <div className="text-lg text-gray-500 mb-4">{user.email}</div>
        <div className="flex items-center mt-4">
          <div className="h-6 w-6 mr-2">
            <Image src="/book.gif" alt="Book count" width={24} height={24} />
          </div>
          <span className="text-lg text-gray-600">Books: {bookCount}</span>
        </div>
      </div>
    </div>
  )
}
