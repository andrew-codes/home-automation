jest.mock("homeassistant")
import { HomeAssistantEntity } from "../../../Domain"
import { equality } from "../../../filter"
import { createDataProvider } from "../queryHomeAssistantEntities"

let ha
let areaDataProvider

beforeEach(() => {
  jest.resetAllMocks()
  ha = {
    states: {
      list: jest.fn(),
    },
  }
})
beforeEach(() => {
  ha.states.list.mockResolvedValue(homeAssistantEntities())
  areaDataProvider = { query: jest.fn() }
})

test("all home assistant entities", async () => {
  areaDataProvider.query.mockResolvedValue([
    { id: "area.gaming_room", name: "Gaming Room" },
    { id: "area.living_room", name: "Living Room" },
  ])
  const sut = createDataProvider(ha, areaDataProvider)
  const actual = await sut.query({ from: "home_assistant_entity" })
  expect(actual).toMatchObject<Array<HomeAssistantEntity>>([
    {
      id: "media_player.nintendo_switch",
      state: "off",
      name: "Nintendo Switch",
      domainId: "media_player",
      areaId: "area.gaming_room",
      attributes: {
        sourceList: ["SWITCH", "PS4"],
        source: "SWITCH",
      },
    },
    {
      id: "media_player.playstation_4",
      domainId: "media_player",

      state: "playing",
      name: "Playstation 4",
      attributes: {
        sourceList: ["FF7", "Nioh 2"],
        source: "Nioh 2",
      },
    },
    {
      id: "device_tracker.person_1",
      domainId: "device_tracker",
      name: "Person 1",
      state: "home",
      attributes: {
        mac: "123",
      },
    },
  ])
})
test("filtered home assistant entities", async () => {
  areaDataProvider.query.mockResolvedValue([
    { id: "area.gaming_room", name: "Gaming Room" },
    { id: "area.living_room", name: "Living Room" },
  ])
  const sut = createDataProvider(ha, areaDataProvider)
  const actual = await sut.query({
    from: "home_assistant_entity",
    filters: [equality("areaId", "area.gaming_room", true)],
  })
  expect(actual).toMatchObject<Array<HomeAssistantEntity>>([
    {
      id: "media_player.playstation_4",
      domainId: "media_player",

      state: "playing",
      name: "Playstation 4",
      attributes: {
        sourceList: ["FF7", "Nioh 2"],
        source: "Nioh 2",
      },
    },
    {
      id: "device_tracker.person_1",
      domainId: "device_tracker",
      name: "Person 1",
      state: "home",
      attributes: {
        mac: "123",
      },
    },
  ])
})

test("queries for other domains return empty result set", async () => {
  const sut = createDataProvider(ha, areaDataProvider)
  const actual = await sut.query({
    from: "domain",
    filters: [equality("name", "Gaming Room")],
  })
  expect(actual).toMatchObject<Array<HomeAssistantEntity>>([])
})

// ---

function homeAssistantEntities() {
  return [
    {
      entity_id: "media_player.nintendo_switch",
      state: "off",
      attributes: {
        friendly_name: "(Gaming Room) Nintendo Switch",
        source_list: ["SWITCH", "PS4"],
        source: "SWITCH",
      },
    },
    {
      entity_id: "media_player.playstation_4",
      state: "playing",
      attributes: {
        source_list: ["FF7", "Nioh 2"],
        source: "Nioh 2",
      },
    },
    {
      entity_id: "device_tracker.person_1",
      state: "home",
      attributes: { friendly_name: "Person 1", mac: "123" },
    },
  ]
}
