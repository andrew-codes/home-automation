type GameCollectionDefinition = {
  name: string
  filter: (games: Game[]) => Game[]
  currentViewIndex: number
  countPerView: number
}
type GameCollection = {
  name: string
  games: Game[]
}

export type { GameCollection, GameCollectionDefinition }
