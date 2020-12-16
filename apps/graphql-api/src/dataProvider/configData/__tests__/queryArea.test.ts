import { Base } from "../../../Domain"
import { equality } from "../../../filter"
import { createDataProvider } from "../queryArea"

jest.mock("homeassistant")

beforeEach(() => {
  jest.resetAllMocks()
})

test("all areas", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({ from: "area" })
  expect(actual).toMatchObject<Array<Base>>([
    { id: "area.gaming_room", name: "Gaming Room" },
    { id: "area.andrew_s_office", name: "Andrew's Office" },
    { id: "area.dorri_s_office", name: "Dorri's Office" },
    { id: "area.kitchen", name: "Kitchen" },
    { id: "area.living_room", name: "Living Room" },
    { id: "area.master_bedroom", name: "Master Bedroom" },
    { id: "area.master_bathroom", name: "Master Bathroom" },
    { id: "area.guest_bedroom", name: "Guest Bedroom" },
    { id: "area.guest_bathroom", name: "Guest Bathroom" },
  ])
})

test("filtered areas", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({
    from: "area",
    filters: [equality("name", "Gaming Room")],
  })
  expect(actual).toMatchObject<Array<Base>>([
    { id: "area.gaming_room", name: "Gaming Room" },
  ])
})

test("queries for other domains return empty result set", async () => {
  const sut = createDataProvider()
  const actual = await sut.query({
    from: "domain",
    filters: [equality("name", "Gaming Room")],
  })
  expect(actual).toMatchObject<Array<Base>>([])
})
