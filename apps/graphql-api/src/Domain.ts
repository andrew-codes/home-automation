import { Filter } from "./filter/filter"

export type DomainEntityDomain = "entity_domain"
export type DomainHomeAssistantEntity = "home_assistant_entity"
export type DomainArea = "area"
export type DomainError = "error"
export type Domain =
  | DomainEntityDomain
  | DomainHomeAssistantEntity
  | DomainArea
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

export interface DomainQuery<TDomain extends Domain> {
  filters?: Array<Filter<TDomain>>
  from: TDomain
}

export type DomainResults = {
  area: Area
  entity_domain: EntityDomain
  home_assistant_entity: HomeAssistantEntity
  error: Error
}
