type GameRelease = {
  lastActivity: Date | null
  description: string
  releaseYear: number
  releaseDate: Date | null
}
type Game = {
  id: string
  name: string
  coverImage: string
  backgroundImage: string
  platformReleases: GameRelease[]
}

export type { GameRelease, Game }
