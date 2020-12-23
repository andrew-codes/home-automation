import { Filter } from "./filter/filter"

export type DomainEntityDomain = "entity_domain"
export type DomainHomeAssistantEntity = "home_assistant_entity"
export type DomainArea = "area"
export type DomainError = "error"
export type DomainGame = "game"
export type Domain =
  | DomainEntityDomain
  | DomainHomeAssistantEntity
  | DomainArea
  | DomainGame
  | DomainError

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
  platformId: string
  description: string | null
  favorite: boolean
  coverImage: string | null
  gameImagePath: string | null
  sourceId: string
  state: GameState
  playtime: number
  releaseYear: number | null
  hidden: boolean
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
}
