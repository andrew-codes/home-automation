jest.mock("homeassistant")
import { createDataProvider } from "../queryEntityDomain"
import { equality } from "../../../filter"
import { EntityDomain } from "../../../Domain"
import { UnsupportedDomainError } from "../../Errors"

beforeEach(() => {
  jest.resetAllMocks()
})

test("all domains", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({ from: "entity_domain" })
  expect(actual).toMatchObject<Array<EntityDomain>>([
    { id: "light", name: "Light" },
    { id: "media_player", name: "Media Player" },
    { id: "device_tracker", name: "Device Tracker" },
    { id: "sensor", name: "Sensor" },
  ])
})

test("filtered domains", async () => {
  const sut = createDataProvider()

  const actual = await sut.query({
    from: "entity_domain",
    filters: [equality("id", "light"), equality("id", "device_tracker")],
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
