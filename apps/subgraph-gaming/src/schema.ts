import { typeDefs as scalarTypeDefs } from "graphql-scalars"

const schema = `
  ${scalarTypeDefs.join(`

  `)}

  type Query {
    areas: [GameArea!]!
    gameReleaseById(id: ID!): GameRelease!
    games: [Game!]!
    genres: [GameGenre!]!
    platforms: [GamePlatform!]!
    completionStates: [GameCompletionState!]!
  }

  type Mutation {
    startGame(gameReleaseId: ID!, areaId: String!): GameRelease
    stopGame(gameReleaseId: ID!, areaId: String!): GameRelease
  }

  type GamePlatform @key(fields: "id") {
    releases: [GameRelease!]!
    id: ID!
    name: String!
    areas: [GameArea!]!
  }

  type GameGenre @key(fields: "id") {
    games: [Game!]!
    id: ID!
    name: String!
  }

  type GameSeries @key(fields: "id") {
    games: [Game!]!
    id: ID!
    name: String!
  }

  type GameSource @key(fields: "id") {
    games: [Game!]!
    id: ID!
    name: String!
  }

  type Game @key(fields: "id") {
    backgroundImage: String
    coverImage: String
    genres: [GameGenre!]!
    id: ID!
    name: String!
    releases: [GameRelease!]!
    series: [GameSeries!]!
  }

  type GameArea @key(fields: "id") {
    id: ID!
    name: String!
    activity: GameActivity
    platforms: [GamePlatform!]!
  }

  type GameActivity {
    id: ID!
    area: GameArea
    release: GameRelease!
    isInstalled: Boolean!
    isInstalling: Boolean!
    isLaunching: Boolean!
    isRunning: Boolean!
    isUninstalling: Boolean!
  }

  type GameCompletionState @key(fields: "id") {
    id: ID!
    name: String!
    releases: [GameRelease!]!
  }

  type GameRelease @key(fields: "id") {
    added: DateTime!
    completionState: GameCompletionState!
    communityScore: Int
    criticScore: Int
    description: String
    game: Game!
    activities: [GameActivity!]!
    id: ID!
    lastActivity: DateTime
    platform: GamePlatform!
    playCount: Int!
    playId: String!
    playniteId: String!
    playTime: Time
    releaseDate: Date
    releaseYear: Int
    source: GameSource
  }
`

export default schema
