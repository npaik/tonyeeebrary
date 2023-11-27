import Image from "next/image";
import Link from "next/link";
import { type Post } from "@/db/queries/postsFeed";
import PostActions from "@/components/post-actions";

import timeAgoShort from "@/utils/timeAgoShort";
import { deletePost } from "./actions";

export default function FeedPost({ post }: { post: Post }) {
  function PostBooks() {
    if (post.books) {
      return (
        <Link href={`/book/${post.books.id}`}>
          <div className="relative rounded-xl overflow-hidden h-full">
            <Image
              className="object-cover"
              src={post.covers?.url || "/default-cover.jpg"}
              alt="EPUB Cover"
              width={200}
              height={300}
              // layout="fill"
              // objectFit="cover"
            />
          </div>
        </Link>
      );
    }
    return null;
  }

  return (
    <div className="grid grid-cols-3 gap-4 p-4 border-b border-gray-300 hover:bg-gray-50 transition duration-150">
      <div className="col-span-1 bg-gray-100 overflow-hidden rounded-lg">
        <PostBooks />
      </div>
      <div className="col-span-2 space-y-4">
        <h2 className="text-lg font-semibold line-clamp-2">{post.title}</h2>
        <p className="text-sm text-gray-600">{post.author}</p>
        <p className="text-xs text-gray-500">
          {timeAgoShort(new Date(post.createdAt))}
        </p>
        {post.books && post.books.url && (
          <div className="flex justify-between items-center mt-2">
            <Link
              href={`/book/${post.books.id}`}
              className="text-green-600 hover:text-green-800 transition duration-150"
            >
              View
            </Link>
            <Link
              href={post.books.url}
              download
              className="text-blue-600 hover:text-blue-800 transition duration-150"
            >
              Download
            </Link>
            <PostActions onDelete={deletePost.bind(null, post.id)} />
          </div>
        )}
      </div>
    </div>
  );
}
