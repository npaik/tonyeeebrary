import Link from "next/link"
import SignoutButton from "@/components/sign-out-button"
import { signOut } from "@/auth"

import { twMerge } from "tailwind-merge"

export default async function NavBar({ className }: { className?: string }) {
  return (
    <nav className="container mx-auto flex items-center justify-between p-4">
      <Link className="text-4xl font-bold" href="/">
        TonEEEbrary
      </Link>
      <div className="flex items-center space-x-4">
        <Link
          className="mt-4 ml-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
          href="/"
        >
          Read Books
        </Link>
        <Link
          href="/create"
          className="mt-4 ml-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        >
          Add New Book
        </Link>
        <Link
          href="/me"
          className="mt-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
        >
          Profile
        </Link>
        <SignoutButton
          signOut={async () => {
            "use server"
            await signOut({ redirectTo: "/" })
          }}
        />
      </div>
    </nav>
  )
}
