type PreparedMediaMode = "prefetch" | "preload"

type PreparedMedia = {
  mode: PreparedMediaMode
  url: string
}

export type { PreparedMedia, PreparedMediaMode }
