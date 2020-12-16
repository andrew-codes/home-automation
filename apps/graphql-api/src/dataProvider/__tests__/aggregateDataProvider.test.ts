import { Base, HomeAssistantEntity } from "../../Domain"
import { createDataProvider } from "../aggregateDataProvider"

const p1 = { query: jest.fn() }
const p2 = { query: jest.fn() }
const p3 = { query: jest.fn() }
const p4 = { query: jest.fn() }

test("aggregates data from multiple providers and returns a single, merged, result set", async () => {
  p1.query.mockResolvedValue([
    { areaId: "area.gaming_room", id: "media_player.playstaion_4" },
  ])
  p2.query.mockResolvedValue([
    {
      domainId: "media_player",
      id: "media_player.playstaion_4",
      attributes: {
        source: "PS4",
      },
    },
  ])
  p3.query.mockResolvedValue([
    {
      id: "media_player.playstaion_4",
      attributes: {
        sourceList: ["PS4", "PC"],
      },
    },
  ])
  p4.query.mockResolvedValue([
    {
      id: "media_player.playstaion_4",
      state: "idle",
      name: "Playstation 4",
    },
  ])
  const sut = createDataProvider([p1, p2, p3, p4])
  const actual = await sut.query({ from: "area" })

  expect(actual).toMatchObject<HomeAssistantEntity[]>([
    {
      id: "media_player.playstaion_4",
      areaId: "area.gaming_room",
      domainId: "media_player",
      name: "Playstation 4",
      state: "idle",
      attributes: {
        source: "PS4",
        sourceList: ["PS4", "PC"],
      },
    },
  ])
})
