import { useState, useEffect } from "react";
import type { SelectedFile } from "../FileUpload";

export function useThumbnails(file?: SelectedFile) {
  const [thumbnails, setThumbnails] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!file?.url) return

    let cancelled = false

    const generate = async () => {
      setLoading(true)
      setError(null)

      try {
        const video = document.createElement("video")
        video.src = file.url
        video.muted = true
        video.playsInline = true

        await new Promise<void>((resolve, reject) => {
          video.onloadedmetadata = () => resolve()
          video.onerror = () => reject(new Error("Failed to load video"))
        })

        const duration = video.duration
        const captureTimes = [duration * 0.25, duration * 0.5, duration * 0.75]

        const captureFrame = (time: number) =>
          new Promise<string>((resolve) => {
            video.currentTime = time
            video.onseeked = () => {
              const canvas = document.createElement("canvas")
              canvas.width = video.videoWidth
              canvas.height = video.videoHeight
              const ctx = canvas.getContext("2d")
              if (!ctx) return resolve("")
              ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
              resolve(canvas.toDataURL("image/jpeg"))
            }
          })

        const results: string[] = []
        for (const t of captureTimes) {
          results.push(await captureFrame(t))
        }

        if (!cancelled) setThumbnails(results)
      } catch (err: any) {
        if (!cancelled) setError(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    generate()

    return () => {
      cancelled = true
    }
  }, [file?.url])

  return { thumbnails, loading, error }
}