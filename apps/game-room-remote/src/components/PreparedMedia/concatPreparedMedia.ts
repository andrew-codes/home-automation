import { filter } from "lodash/fp"
import type { PreparedMedia } from "./types"

const onlyNewMedia = (existingMedia: PreparedMedia[]) =>
  filter<PreparedMedia>((newMedia) => {
    const matchedMedia = existingMedia.find((m) => m.url === newMedia.url)

    return (
      !matchedMedia ||
      (matchedMedia.mode === "prefetch" && newMedia.mode === "preload")
    )
  })

const concatPreparedMedia =
  (media: PreparedMedia[]) =>
  (existingMedia: PreparedMedia[] = []): [PreparedMedia[], PreparedMedia[]] => {
    const newMedia = onlyNewMedia(existingMedia)(media)

    return [newMedia, existingMedia.concat(newMedia)]
  }

export default concatPreparedMedia
