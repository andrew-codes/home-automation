type GameCollectionDefinition = {
  id: string
  name: string
  filter: (games: Game[]) => Game[]
  currentPageIndex: number
  countPerPage: number
}
type GameCollection = {
  id: string
  name: string
  games: Game[]
  currentPageIndex: number
  countPerPage: number
}

export type { GameCollection, GameCollectionDefinition }
