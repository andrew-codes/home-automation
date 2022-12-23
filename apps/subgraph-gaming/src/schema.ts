import { typeDefs as scalarTypeDefs } from "graphql-scalars"

const schema = `
  ${scalarTypeDefs.join(`

  `)}
  type Query {
    games: [Game!]!
    genres: [GameGenre!]!
    platforms: [GamePlatform!]!
  }

  type GamePlatform @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameGenre @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameSeries @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type GameSource @key(fields: "id") {
    id: ID!
    name: String!
    games: [Game!]!
  }

  type Game @key(fields: "id") {
    id: ID!
    added: DateTime!
    backgroundImage: String
    coverImage: String
    playId: String!
    genres: [GameGenre!]!
    name: String!
    platformReleases: [GameRelease!]!
    series: [GameSeries!]!
  }

  type GameRelease @key(fields: "id") {
    id: ID!
    communityScore: Int
    criticScore: Int
    gameId: Game!
    description: String
    isInstalled: Boolean!
    isInstalling: Boolean!
    isLaunching: Boolean!
    isRunning: Boolean!
    isUninstalling: Boolean!
    platform: GamePlatform!
    recentActivity: DateTime
    source: GameSource
    releaseDate: Date
    releaseYear: Int
  }
`

export default schema
