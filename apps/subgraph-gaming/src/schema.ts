import { typeDefs as scalarTypeDefs } from "graphql-scalars"

const schema = `
  ${scalarTypeDefs.join(`

  `)}

  type Query {
    gameReleaseById(id: String!): GameRelease!
    games: [Game!]!
    genres: [GameGenre!]!
    platforms: [GamePlatform!]!
  }

  type Mutation {
    startGame(id: String!, areaId: String!): GameRelease
    stopGame(id: String!, areaId: String!): GameRelease
  }

  type GamePlatform @key(fields: "id") {
    games: [Game!]!
    id: ID!
    name: String!
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

  type GameRelease @key(fields: "id") {
    added: DateTime!
    communityScore: Int
    criticScore: Int
    description: String
    game: Game!
    id: ID!
    isInstalled: Boolean!
    isInstalling: Boolean!
    isLaunching: Boolean!
    isRunning: Boolean!
    isUninstalling: Boolean!
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
