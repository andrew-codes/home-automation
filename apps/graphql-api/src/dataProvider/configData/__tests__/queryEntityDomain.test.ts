jest.mock("homeassistant")
import { createDataProvider } from "../queryEntityDomain"
import { equality } from "../../../filter"
import { DomainEntityDomain, EntityDomain } from "../../../Domain"
import { UnsupportedDomainError } from "../../Errors"

beforeEach(() => {
  jest.resetAllMocks()
})

test("all domains", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({ from: "entity_domain" })
  expect(actual).toMatchObject<Array<EntityDomain>>([
    { id: "device_tracker", name: "Device Tracker" },
    { id: "group", name: "Group" },
    { id: "light", name: "Light" },
    { id: "media_player", name: "Media Player" },
    { id: "sensor", name: "Sensor" },
  ])
})

test("filtered domains by non-ID", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({
    from: "entity_domain",
    filters: [equality<DomainEntityDomain>("name", "Light")],
  })
  expect(actual).toMatchObject<EntityDomain[]>([
    {
      id: "light",
      name: "Light",
    },
  ])
})

test("filtered domains by ID", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({
    from: "entity_domain",
    filters: [equality<DomainEntityDomain>("id", "light")],
  })
  expect(actual).toMatchObject<EntityDomain>({
    id: "light",
    name: "Light",
  })
})

test("filtered domains by multiple IDs", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({
    from: "entity_domain",
    filters: [
      equality<DomainEntityDomain>("id", "light"),
      equality<DomainEntityDomain>("id", "device_tracker"),
    ],
  })
  expect(actual).toMatchObject<Array<EntityDomain>>([
    { id: "light", name: "Light" },
    { id: "device_tracker", name: "Device Tracker" },
  ])
})

test("queries for other domains to throw an error", async () => {
  const sut = createDataProvider()
  try {
    await sut.query({
      from: "area",
      filters: [equality("name", "Gaming Room")],
    })
  } catch (e) {
    expect(e).toMatchObject(new UnsupportedDomainError("area"))
  }
})
