type GameCollectionDefinition = {
  id: string
  name: string
  filter: (games: any) => any
}

export { GameCollectionDefinition }
