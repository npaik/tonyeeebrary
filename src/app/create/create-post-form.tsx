"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { twMerge } from "tailwind-merge";
import { createPost, getSignedURL } from "./actions";
import ePub from "epubjs";

export default function CreatePostForm({
  user,
}: {
  user: { name?: string | null; image?: string | null };
}) {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [file, setFile] = useState<File | null>(null); // For EPUBs
  const [coverImageFile, setCoverImageFile] = useState<File | null>(null); // For cover images
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const buttonDisabled = title.length < 1 || author.length < 1 || !file;

  const computeSHA256 = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return hashHex;
  };

  const handleUpload = async (file: File, fileCategory: "book" | "cover") => {
    const signedURLResult = await getSignedURL({
      fileSize: file.size,
      fileType: file.type,
      checksum: await computeSHA256(file),
      fileCategory: fileCategory,
    });

    if (signedURLResult.failure) {
      throw new Error(signedURLResult.failure);
    }

    if (
      !signedURLResult.success ||
      typeof signedURLResult.success.url !== "string"
    ) {
      throw new Error("Failed to get a valid response from getSignedURL");
    }

    const { url, id: fileId } = signedURLResult.success;

    await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });

    return { fileId, fileCategory };
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      let bookFileIds: number[] = [];
      let coverFileIds: number[] = [];

      if (file) {
        setStatusMessage("Uploading EPUB...");
        const { fileId } = await handleUpload(file, "book");
        bookFileIds.push(fileId);
      }

      if (coverImageFile) {
        setStatusMessage("Uploading cover image...");
        const { fileId } = await handleUpload(coverImageFile, "cover");
        coverFileIds.push(fileId);
      }

      setStatusMessage("Creating post...");

      await createPost({
        title,
        author,
        bookFileIds,
        coverFileIds,
      });

      setTitle("");
      setAuthor("");
      setFile(null);
      setCoverImageFile(null);
      setPreviewUrl(null);
      setStatusMessage("Post successful!");
    } catch (error) {
      console.error(error);
      setStatusMessage("Failed to post");
    } finally {
      setLoading(false);
    }
  };

  const handleEPUB = async (file: File) => {
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target) {
          const arrayBuffer = event.target.result;

          if (arrayBuffer) {
            const book = ePub(arrayBuffer);
            const coverUrl = await book.coverUrl();

            if (coverUrl) {
              setPreviewUrl(coverUrl);
              const response = await fetch(coverUrl);
              const blob = await response.blob();
              const coverImageFile = new File([blob], "cover.jpg", {
                type: "image/jpeg",
              });
              setCoverImageFile(coverImageFile);
            } else {
              setPreviewUrl(null);
              console.log("No cover image found for the EPUB");
            }
          } else {
            console.error("Failed to load file as ArrayBuffer");
            setPreviewUrl(null);
          }
        } else {
          console.error("FileReader event target is null");
          setPreviewUrl(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error("Error processing EPUB file with epub.js:", error);
      setPreviewUrl(null);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFile(file);

    if (file) {
      if (file.type === "application/epub+zip") {
        handleEPUB(file);
      } else if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    } else {
      setPreviewUrl(null);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setCoverImageFile(null);
    setPreviewUrl(null);
  };

  return (
    <>
      <form
        className="max-w-lg mx-auto mt-10 p-6 bg-gray-50 rounded-lg shadow-lg"
        onSubmit={handleSubmit}
      >
        {statusMessage && (
          <p className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded">
            {statusMessage}
          </p>
        )}
        <div className="flex gap-4 items-start pb-4 w-full">
          <div className="rounded-full h-12 w-12 overflow-hidden relative">
            <Link href="/me">
              <Image
                className="object-cover"
                src={user.image || "https://www.gravatar.com/avatar/?d=mp"}
                alt={user.name || "user profile picture"}
                priority={true}
                fill={true}
              />
            </Link>
          </div>

          <div className="flex flex-col gap-2 w-full">
            <Link href="/me">
              <div>{user.name}</div>
            </Link>

            <label className="w-full">
              <input
                className="w-full p-2 mb-3 border border-gray-300 rounded text-lg text-gray-700"
                type="text"
                placeholder="Enter Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <input
                className="w-full p-2 border border-gray-300 rounded text-lg text-gray-700"
                type="text"
                placeholder="Enter Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </label>

            {previewUrl && file && (
              <div className="mt-4">
                {file.type.startsWith("image/") ? (
                  <Image
                    src={previewUrl}
                    alt="Selected file"
                    width={128}
                    height={128}
                  />
                ) : file.type === "application/epub+zip" ? (
                  <Image
                    src={previewUrl}
                    alt="EPUB cover"
                    width={400}
                    height={600}
                  />
                ) : null}
                <button
                  type="button"
                  className="bg-red-500 text-white font-bold py-2 px-4 rounded hover:bg-red-700"
                  onClick={handleRemoveFile}
                >
                  Remove
                </button>
              </div>
            )}

            <label className="flex">
              <svg
                className="w-5 h-5 hover:cursor-pointer transform-gpu active:scale-75 transition-all text-neutral-500"
                aria-label="Attach media"
                role="img"
                viewBox="0 0 20 20"
              >
                <title>Attach media</title>
                <path
                  d="M13.9455 9.0196L8.49626 14.4688C7.16326 15.8091 5.38347 15.692 4.23357 14.5347C3.07634 13.3922 2.9738 11.6197 4.30681 10.2794L11.7995 2.78669C12.5392 2.04694 13.6745 1.85651 14.4289 2.60358C15.1833 3.3653 14.9855 4.4859 14.2458 5.22565L6.83367 12.6524C6.57732 12.9088 6.28435 12.8355 6.10124 12.6671C5.94011 12.4986 5.87419 12.1983 6.12322 11.942L11.2868 6.78571C11.6091 6.45612 11.6164 5.97272 11.3088 5.65778C10.9938 5.35749 10.5031 5.35749 10.1808 5.67975L4.99529 10.8653C4.13835 11.7296 4.1823 13.0626 4.95134 13.8316C5.77898 14.6592 7.03874 14.6446 7.903 13.7803L15.3664 6.32428C16.8678 4.81549 16.8312 2.83063 15.4909 1.4903C14.1799 0.179264 12.1584 0.106021 10.6496 1.60749L3.10564 9.16608C1.16472 11.1143 1.27458 13.9268 3.06169 15.7139C4.8488 17.4937 7.6613 17.6109 9.60955 15.6773L15.1027 10.1841C15.4103 9.87653 15.4103 9.30524 15.0881 9.00495C14.7878 8.68268 14.2677 8.70465 13.9455 9.0196Z"
                  className="fill-current"
                ></path>
              </svg>

              <input
                className="bg-transparent flex-1 border-none outline-none hidden"
                name="media"
                type="file"
                accept="image/jpeg,image/png,application/epub+zip"
                onChange={handleChange}
              />
            </label>
          </div>
        </div>

        <div className="flex justify-between items-center mt-5">
          <button
            type="submit"
            className="bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
            disabled={buttonDisabled}
          >
            Post
          </button>
        </div>
      </form>
    </>
  );
}
