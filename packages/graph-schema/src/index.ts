
const schema = `
schema
  @link(url: "https://specs.apollo.dev/link/v1.0")
  @link(url: "https://specs.apollo.dev/join/v0.3", for: EXECUTION)
{
  query: Query
  mutation: Mutation
}

directive @join__enumValue(graph: join__Graph!) repeatable on ENUM_VALUE

directive @join__field(graph: join__Graph, requires: join__FieldSet, provides: join__FieldSet, type: String, external: Boolean, override: String, usedOverridden: Boolean) repeatable on FIELD_DEFINITION | INPUT_FIELD_DEFINITION

directive @join__graph(name: String!, url: String!) on ENUM_VALUE

directive @join__implements(graph: join__Graph!, interface: String!) repeatable on OBJECT | INTERFACE

directive @join__type(graph: join__Graph!, key: join__FieldSet, extension: Boolean! = false, resolvable: Boolean! = true, isInterfaceObject: Boolean! = false) repeatable on OBJECT | INTERFACE | UNION | ENUM | INPUT_OBJECT | SCALAR

directive @join__unionMember(graph: join__Graph!, member: String!) repeatable on UNION

directive @link(url: String, as: String, for: link__Purpose, import: [link__Import]) repeatable on SCHEMA

scalar AccountNumber
  @join__type(graph: GAMING)

scalar BigInt
  @join__type(graph: GAMING)

scalar Byte
  @join__type(graph: GAMING)

scalar CountryCode
  @join__type(graph: GAMING)

scalar Cuid
  @join__type(graph: GAMING)

scalar Currency
  @join__type(graph: GAMING)

scalar Date
  @join__type(graph: GAMING)

scalar DateTime
  @join__type(graph: GAMING)

scalar DID
  @join__type(graph: GAMING)

scalar Duration
  @join__type(graph: GAMING)

scalar EmailAddress
  @join__type(graph: GAMING)

type Game
  @join__type(graph: GAMING)
{
  backgroundImage: String
  coverImage: String
  genres: [GameGenre!]!
  id: ID!
  name: String!
  releases: [GameRelease!]!
  series: [GameSeries!]!
}

type GameActivity
  @join__type(graph: GAMING)
{
  id: ID!
  area: GameArea!
  release: GameRelease!
  isInstalled: Boolean!
  isInstalling: Boolean!
  isLaunching: Boolean!
  isRunning: Boolean!
  isUninstalling: Boolean!
}

type GameArea
  @join__type(graph: GAMING)
{
  id: ID!
  name: String!
  activity: GameActivity
  platforms: [GamePlatform!]!
}

type GameCompletionState
  @join__type(graph: GAMING)
{
  id: ID!
  name: String!
  releases: [GameRelease!]!
}

type GameGenre
  @join__type(graph: GAMING)
{
  games: [Game!]!
  id: ID!
  name: String!
}

type GamePlatform
  @join__type(graph: GAMING)
{
  releases: [GameRelease!]!
  id: ID!
  name: String!
  areas: [GameArea!]!
}

type GameRelease
  @join__type(graph: GAMING)
{
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

type GameSeries
  @join__type(graph: GAMING)
{
  games: [Game!]!
  id: ID!
  name: String!
}

type GameSource
  @join__type(graph: GAMING)
{
  games: [Game!]!
  id: ID!
  name: String!
}

scalar GUID
  @join__type(graph: GAMING)

scalar Hexadecimal
  @join__type(graph: GAMING)

scalar HexColorCode
  @join__type(graph: GAMING)

scalar HSL
  @join__type(graph: GAMING)

scalar HSLA
  @join__type(graph: GAMING)

scalar IBAN
  @join__type(graph: GAMING)

scalar IP
  @join__type(graph: GAMING)

scalar IPv4
  @join__type(graph: GAMING)

scalar IPv6
  @join__type(graph: GAMING)

scalar ISBN
  @join__type(graph: GAMING)

scalar ISO8601Duration
  @join__type(graph: GAMING)

scalar join__FieldSet

enum join__Graph {
  GAMING @join__graph(name: "gaming", url: "http://subgraph-gaming")
}

scalar JSON
  @join__type(graph: GAMING)

scalar JSONObject
  @join__type(graph: GAMING)

scalar JWT
  @join__type(graph: GAMING)

scalar Latitude
  @join__type(graph: GAMING)

scalar link__Import

enum link__Purpose {
  """
  \`SECURITY\` features provide metadata necessary to securely resolve fields.
  """
  SECURITY

  """
  \`EXECUTION\` features provide metadata necessary for operation execution.
  """
  EXECUTION
}

scalar LocalDate
  @join__type(graph: GAMING)

scalar Locale
  @join__type(graph: GAMING)

scalar LocalEndTime
  @join__type(graph: GAMING)

scalar LocalTime
  @join__type(graph: GAMING)

scalar Long
  @join__type(graph: GAMING)

scalar Longitude
  @join__type(graph: GAMING)

scalar MAC
  @join__type(graph: GAMING)

type Mutation
  @join__type(graph: GAMING)
{
  startGame(gameReleaseId: ID!, areaId: String!): GameRelease
  stopGame(gameReleaseId: ID!, areaId: String!): GameRelease
}

scalar NegativeFloat
  @join__type(graph: GAMING)

scalar NegativeInt
  @join__type(graph: GAMING)

scalar NonEmptyString
  @join__type(graph: GAMING)

scalar NonNegativeFloat
  @join__type(graph: GAMING)

scalar NonNegativeInt
  @join__type(graph: GAMING)

scalar NonPositiveFloat
  @join__type(graph: GAMING)

scalar NonPositiveInt
  @join__type(graph: GAMING)

scalar ObjectID
  @join__type(graph: GAMING)

scalar PhoneNumber
  @join__type(graph: GAMING)

scalar Port
  @join__type(graph: GAMING)

scalar PositiveFloat
  @join__type(graph: GAMING)

scalar PositiveInt
  @join__type(graph: GAMING)

scalar PostalCode
  @join__type(graph: GAMING)

type Query
  @join__type(graph: GAMING)
{
  areas: [GameArea!]!
  gameReleaseById(id: ID!): GameRelease!
  games: [Game!]!
  genres: [GameGenre!]!
  platforms: [GamePlatform!]!
  completionStates: [GameCompletionState!]!
}

scalar RGB
  @join__type(graph: GAMING)

scalar RGBA
  @join__type(graph: GAMING)

scalar RoutingNumber
  @join__type(graph: GAMING)

scalar SafeInt
  @join__type(graph: GAMING)

scalar SemVer
  @join__type(graph: GAMING)

scalar Time
  @join__type(graph: GAMING)

scalar Timestamp
  @join__type(graph: GAMING)

scalar TimeZone
  @join__type(graph: GAMING)

scalar UnsignedFloat
  @join__type(graph: GAMING)

scalar UnsignedInt
  @join__type(graph: GAMING)

scalar URL
  @join__type(graph: GAMING)

scalar USCurrency
  @join__type(graph: GAMING)

scalar UtcOffset
  @join__type(graph: GAMING)

scalar UUID
  @join__type(graph: GAMING)

scalar Void
  @join__type(graph: GAMING)
`

export default schema
