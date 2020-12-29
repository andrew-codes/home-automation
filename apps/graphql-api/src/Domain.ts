import { Filter } from "./filter/filter"

export type DomainEntityDomain = "entity_domain"
export type DomainHomeAssistantEntity = "home_assistant_entity"
export type DomainArea = "area"
export type DomainError = "error"
export type DomainGame = "game"
export type DomainGameCover = "game_cover"
export type DomainGameArtwork = "game_artwork"
export type DomainGameGenre = "game_genre"
export type DomainGameCollection = "game_collection"
export type DomainGameFranchise = "game_franchise"
export type DomainGameMultiplayerMode = "game_multiplayer_mode"
export type DomainGamePlayerPerspective = "game_player_perspective"
export type DomainGameKeyword = "game_keyword"
export type Domain =
  | DomainEntityDomain
  | DomainHomeAssistantEntity
  | DomainArea
  | DomainGame
  | DomainError
  | DomainGameCover
  | DomainGameArtwork
  | DomainGameGenre
  | DomainGameCollection
  | DomainGameFranchise
  | DomainGameMultiplayerMode
  | DomainGamePlayerPerspective
  | DomainGameKeyword

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
  genres: number[]
  hidden: boolean
  keywords: number[]
  multiplayerMode: number
  platformId: string
  playerPerspective: number
  playniteId: string
  playtime: number
  releaseDates: number[]
  slug: string
  sourceId: string
  state: GameState
  summary?: string
  url: string
}
export interface GameImage extends Base {
  imageId: string
  height: number
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

export interface DomainQuery<TDomain extends Domain> {
  filters?: Array<Filter<TDomain>>
  from: TDomain
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
}
