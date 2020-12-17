import { FilterDefinition } from "./filter/filter"

export type DomainEntityDomain = "entity_domain"
export type DomainHomeAssistantEntity = "home_assistant_entity"
export type DomainArea = "area"
export type Domain = DomainEntityDomain | DomainHomeAssistantEntity | DomainArea

export type LightState = "on" | "off"
export type MediaPlayerState = "on" | "off" | "standby" | "idle" | "playing"
export type DeviceTrackerState = "home" | "not_home"
export type HomeAssistantEntityState =
  | LightState
  | MediaPlayerState
  | DeviceTrackerState

export interface Base {
  name: string
  id: string
}

export interface BaseEntity extends Base {
  areaId?: string
  domainId: string
  parentId: string
}
export interface HomeAssistantEntityWithState<TStateType> extends BaseEntity {
  state: TStateType
}

export interface MediaPlayer
  extends HomeAssistantEntityWithState<MediaPlayerState> {
  attributes: {
    sourceList: Array<string>
    source: string
  }
}

export interface DeviceTracker
  extends HomeAssistantEntityWithState<DeviceTrackerState> {
  attributes: {
    mac: string
  }
}

export type HomeAssistantEntity = MediaPlayer | DeviceTracker

export interface DomainQuery<TDomain extends Domain> {
  from: TDomain
  filters?: Array<FilterDefinition>
}

export type DomainResults = {
  home_assistant_entity: HomeAssistantEntity
  entity_domain: Base
  area: Base
}
