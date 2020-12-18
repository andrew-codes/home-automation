jest.mock("homeassistant")
import HomeAssistant from "homeassistant"
import { DomainHomeAssistantEntity, HomeAssistantEntity } from "../../../Domain"
import { equality } from "../../../filter"
import { UnsupportedDomainError } from "../../Errors"
import { createDataProvider } from "../queryHomeAssistantEntities"

const ha = { states: { list: jest.fn() } }
beforeEach(() => {
  jest.resetAllMocks()
})
beforeEach(() => {
  HomeAssistant.mockImplementation(() => ha)
  ha.states.list.mockResolvedValue(homeAssistantEntities())
})

test("all home assistant entities", async () => {
  const sut = createDataProvider()
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

test("caches API results", async () => {
  const sut = createDataProvider()
  await sut.query({ from: "home_assistant_entity" })
  await sut.query({ from: "home_assistant_entity" })
  await sut.query({ from: "home_assistant_entity" })
  await sut.query({ from: "home_assistant_entity" })
  expect(ha.states.list).toHaveBeenCalledTimes(1)
})

test("filtered home assistant entities by non-ID", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({
    from: "home_assistant_entity",
    filters: [
      equality<DomainHomeAssistantEntity>("domainId", "device_tracker", true),
    ],
  })
  expect(actual).toMatchObject<Array<HomeAssistantEntity>>([
    {
      id: "media_player.nintendo_switch",
      domainId: "media_player",
      state: "off",
      name: "Nintendo Switch",
      attributes: {
        source: "SWITCH",
        sourceList: ["SWITCH", "PS4"],
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
  ])
})

test("filtered home assistant entities by ID", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({
    from: "home_assistant_entity",
    filters: [
      equality<DomainHomeAssistantEntity>(
        "id",
        "media_player.nintendo_switch",
        true
      ),
    ],
  })
  expect(actual).toMatchObject<HomeAssistantEntity>({
    id: "media_player.nintendo_switch",
    domainId: "media_player",
    state: "off",
    name: "Nintendo Switch",
    attributes: {
      source: "SWITCH",
      sourceList: ["SWITCH", "PS4"],
    },
  })
})

test("filtered home assistant entities by multiple IDs", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({
    from: "home_assistant_entity",
    filters: [
      equality<DomainHomeAssistantEntity>(
        "id",
        "media_player.nintendo_switch",
        true
      ),
      equality<DomainHomeAssistantEntity>(
        "id",
        "media_player.playstation_4",
        true
      ),
    ],
  })
  expect(actual).toMatchObject<HomeAssistantEntity[]>([
    {
      id: "media_player.nintendo_switch",
      domainId: "media_player",
      state: "off",
      name: "Nintendo Switch",
      attributes: {
        source: "SWITCH",
        sourceList: ["SWITCH", "PS4"],
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
  ])
})

test("queries for other domains throws an error", async () => {
  const sut = createDataProvider()
  try {
    await sut.query({
      from: "domain",
      filters: [equality("name", "Gaming Room")],
    })
  } catch (e) {
    expect(e).toMatchObject(new UnsupportedDomainError("domain"))
  }
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
