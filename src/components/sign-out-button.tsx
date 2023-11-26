"use client"

export default function SignoutButton({ signOut }: { signOut: () => void }) {
  return (
    <button
      className="mt-4 ml-4 inline-block bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition duration-300"
      onClick={() => {
        signOut()
      }}
    >
      Sign out
    </button>
  )
}
