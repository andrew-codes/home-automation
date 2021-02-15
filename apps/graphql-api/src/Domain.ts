import { Filter } from "./filter/filter"

export type DomainArea = "area"
export type DomainEntityDomain = "entity_domain"
export type DomainError = "error"
export type DomainGame = "game"
export type DomainGameArtwork = "game_artwork"
export type DomainGameCollection = "game_collection"
export type DomainGameCover = "game_cover"
export type DomainGameFranchise = "game_franchise"
export type DomainGameGenre = "game_genre"
export type DomainGameKeyword = "game_keyword"
export type DomainGameMode = "game_mode"
export type DomainGameMultiplayerMode = "game_multiplayer_mode"
export type DomainGamePlatform = "game_platform"
export type DomainGamePlayerPerspective = "game_player_perspective"
export type DomainHomeAssistantEntity = "home_assistant_entity"
export type Domain =
  | DomainArea
  | DomainEntityDomain
  | DomainError
  | DomainGame
  | DomainGameArtwork
  | DomainGameCollection
  | DomainGameCover
  | DomainGameFranchise
  | DomainGameGenre
  | DomainGameKeyword
  | DomainGameMode
  | DomainGameMultiplayerMode
  | DomainGamePlatform
  | DomainGamePlayerPerspective
  | DomainHomeAssistantEntity

export type LightState = "on" | "off"
export type MediaPlayerState = "on" | "off" | "standby" | "idle" | "playing"
export type DeviceTrackerState = "home" | "not_home"
export type HomeAssistantEntityState =
  | LightState
  | MediaPlayerState
  | DeviceTrackerState

export interface Base {
  id: string
  name: string
}

export interface BaseEntity extends Base {
  areaId?: string
  domainId: string
}

export interface HomeAssistantEntityWithState<TStateType> extends BaseEntity {
  state: TStateType
}

export interface MediaPlayer
  extends HomeAssistantEntityWithState<MediaPlayerState> {
  attributes: {
    source: string
    sourceList: Array<string>
  }
}

export interface DeviceTracker
  extends HomeAssistantEntityWithState<DeviceTrackerState> {
  attributes: {
    mac?: string
    sourceType?: string
    isWired?: boolean
    isGuestByUap?: boolean
    apMac?: string
    authorized?: boolean
    essid?: string
    ip?: string
    is11R?: boolean
    isGuest?: boolean
    qosPolicyApplied?: boolean
    radio?: string
    radioProto?: string
    vlan?: number
    hostname?: string
    oui?: string
  }
}

export interface Group
  extends HomeAssistantEntityWithState<DeviceTrackerState> {
  attributes: {
    entityId: string[]
  }
}

export interface EntityDomain extends Base {}
export interface Area extends Base {}
export type HomeAssistantEntity = MediaPlayer | DeviceTracker | Group
export type GameState =
  | "Installed"
  | "Not Installed"
  | "Installing"
  | "Uninstalling"
  | "Launching"
  | "Running"
export interface GameEntity extends Base {
  artworks?: number[]
  category: number
  collection: number
  cover: number
  favorite: boolean
  firstReleaseDate: number
  franchise: number
  franchises: number[]
  gameModes: number[]
  genres: number[]
  hidden: boolean
  isInstalled: boolean
  IsInstalling: boolean
  isUninstalling: boolean
  launching: boolean
  running: boolean
  keywords: number[]
  multiplayerModes: number[]
  platformId: string
  playerPerspective: number
  playniteId: string
  playtime: number
  releaseDates: number[]
  slug: string
  sourceId: string
  source: {
    id: string
    name: string
  }
  isStarted: boolean
  isStarting: boolean
  state: GameState
  summary?: string
  url: string
}
export interface GameImage extends Base {
  imageId: string
  height: number
}
export interface GameMode extends Base {
  slug: string
}
export interface GameGenre extends Base {
  slug: string
}
export interface GameCollection extends Base {
  slug: string
  games: number[]
}
export interface GameFranchise extends Base {
  slug: string
  games: number[]
}
export interface GameKeyword extends Base {
  slug: string
}
export interface GameMultiplayerMode extends Base {
  campaigncoop: boolean
  dropIn: boolean
  lancoop: boolean
  offlinecoop: boolean
  offlinecoopmax: number
  offlinemax: number
  onlinecoop: boolean
  onlinecoopmax: number
  onlinemax: number
  platform: number
  splitscreen: boolean
}
export interface GamePlayerPerspective extends Base {
  slug: string
}
export interface GamePlatform extends Base {}

export enum Sort {
  asc = 1,
  desc = -1,
}
export type OrderBy<TDomain extends Domain> = {
  [P in keyof TDomain]: Sort
}
export type DomainQuery<TDomain extends Domain> = {
  filters?: Array<Filter<TDomain>>
  from: TDomain
  orderBy: OrderBy<TDomain>
}

export type DomainResults = {
  area: Area
  entity_domain: EntityDomain
  home_assistant_entity: HomeAssistantEntity
  error: Error
  game: GameEntity
  game_cover: GameImage
  game_artwork: GameImage
  game_genre: GameGenre
  game_collection: GameCollection
  game_franchise: GameFranchise
  game_multiplayer_mode: GameMultiplayerMode
  game_player_perspective: GamePlayerPerspective
  game_keyword: GameKeyword
  game_platform: GamePlatform
  game_mode: GameMode
}
