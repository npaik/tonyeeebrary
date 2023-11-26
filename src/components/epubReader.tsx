"use client"
import React, { useEffect, useRef } from "react"
import ePub from "epubjs"

declare global {
  interface Window {
    nextPage: () => void
    previousPage: () => void
  }
}

interface EpubReaderProps {
  bookUrl: string
}

interface Rendition {
  display: () => Promise<any>
  destroy: () => void
  next: () => Promise<any>
  prev: () => Promise<any>
}

// window.speechSynthesis.speak(new SpeechSynthesisUtterance("Hello Tony."));
const readText = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  window.speechSynthesis.speak(utterance)
}

const EpubReader: React.FC<EpubReaderProps> = ({ bookUrl }) => {
  const viewerRef = useRef<HTMLDivElement>(null)
  let currentRendition: Rendition | null = null

  useEffect(() => {
    let active = true

    if (!viewerRef.current) {
      console.error("Viewer ref is not attached to a DOM element.")
      return
    }

    const book = ePub(bookUrl, { openAs: "epub" })

    book.ready
      .then(() => {
        if (!active || !viewerRef.current) return
        // eslint-disable-next-line react-hooks/exhaustive-deps
        currentRendition = book.renderTo(viewerRef.current, { width: "100%", height: "100%" })

        currentRendition.display().catch((error) => {
          if (active) {
            console.error("Error displaying book:", error)
          }
        })
      })
      .catch((error) => {
        console.error("Error initializing book:", error)
      })

    const applyAnimation = (next: boolean) => {
      if (viewerRef.current) {
        const outClass = next ? "slide-out-left" : "slide-out-right"
        const inClass = next ? "slide-in-right" : "slide-in-left"

        viewerRef.current.classList.add(outClass)
        setTimeout(() => {
          viewerRef.current?.classList.remove(outClass)
          viewerRef.current?.classList.add(inClass)
          setTimeout(() => {
            viewerRef.current?.classList.remove(inClass)
          }, 600)
        }, 600)
      }
    }

    const nextPage = () => {
      currentRendition
        ?.next()
        .then(() => {
          applyAnimation(true)

          // Replace textToRead with the text from the page
          const textToRead = "Text to speech"
          // readText(textToRead)
        })
        .catch((error) => {
          console.error("Error going to the next page:", error)
        })
    }

    const previousPage = () => {
      currentRendition
        ?.prev()
        .then(() => applyAnimation(false))
        .catch((error) => {
          console.error("Error going to the previous page:", error)
        })
    }

    window.nextPage = nextPage
    window.previousPage = previousPage

    return () => {
      active = false
      currentRendition?.destroy()
    }
  }, [bookUrl])

  return (
    <div className="flex flex-col items-center justify-center pt-8 px-4">
      <div className="rounded-xl shadow-lg overflow-hidden" style={{ width: "90%", height: "auto" }}>
        <div ref={viewerRef} style={{ width: "100%", height: "80vh" }}></div>
      </div>
      <div className="flex justify-around mt-4 w-full max-w-lg mx-auto">
        <button
          className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded"
          onClick={() => window.previousPage()}
        >
          Previous Page
        </button>
        <button
          className="bg-green-600 hover:bg-green-800 text-white font-bold py-2 px-4 rounded ml-2"
          onClick={() => window.nextPage()}
        >
          Next Page
        </button>
      </div>
    </div>
  )
}

export default EpubReader
