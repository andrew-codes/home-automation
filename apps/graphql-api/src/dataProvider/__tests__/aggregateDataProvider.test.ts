import { HomeAssistantEntity } from "../../Domain"
import { UnsupportedDomainError } from "../Errors"
import { createDataProvider } from "../aggregateDataProvider"

const p1 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p2 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p3 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p4 = { query: jest.fn(), canExecuteQuery: jest.fn() }

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
  p1.canExecuteQuery.mockReturnValue(true)
  p2.canExecuteQuery.mockReturnValue(true)
  p3.canExecuteQuery.mockReturnValue(true)
  p4.canExecuteQuery.mockReturnValue(true)
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

test("any provider not supporting a query throws an exception", async () => {
  p1.canExecuteQuery.mockReturnValue(true)
  p2.canExecuteQuery.mockReturnValue(false)
  p3.canExecuteQuery.mockReturnValue(true)
  p4.canExecuteQuery.mockReturnValue(true)
  const sut = createDataProvider([p1, p2, p3, p4])
  try {
    await sut.query({ from: "area" })
  } catch (e) {
    expect(e).toMatchObject(new UnsupportedDomainError("area"))
  }
})
