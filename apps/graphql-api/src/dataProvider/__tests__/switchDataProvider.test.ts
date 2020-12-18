import { HomeAssistantEntity } from "../../Domain"
import { UnsupportedDomainError } from "../Errors"
import { createDataProvider } from "../switchDataProvider"

const p1 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p2 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p3 = { query: jest.fn(), canExecuteQuery: jest.fn() }
const p4 = { query: jest.fn(), canExecuteQuery: jest.fn() }

test("selects first matching provider to return results", async () => {
  p1.query.mockResolvedValue([
    { areaId: "area.gaming_room", id: "media_player.playstaion_4" },
  ])
  p2.query.mockResolvedValue([
    {
      id: "media_player.playstaion_4",
      name: "Playstation 4",
      domainId: "media_player",
      state: "idle",
      attributes: {
        source: "PS4",
        sourceList: ["PS4"],
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
  p1.canExecuteQuery.mockReturnValue(false)
  p2.canExecuteQuery.mockReturnValue(true)
  p3.canExecuteQuery.mockReturnValue(true)
  p4.canExecuteQuery.mockReturnValue(false)
  const sut = createDataProvider([p1, p2, p3, p4])
  const actual = await sut.query({ from: "area" })

  expect(actual).toMatchObject<HomeAssistantEntity[]>([
    {
      domainId: "media_player",
      state: "idle",
      name: "Playstation 4",
      id: "media_player.playstaion_4",
      attributes: {
        source: "PS4",
        sourceList: ["PS4"],
      },
    },
  ])
})

test("no matching providers throws exception", async () => {
  p1.canExecuteQuery.mockReturnValue(false)
  p2.canExecuteQuery.mockReturnValue(false)
  p3.canExecuteQuery.mockReturnValue(false)
  p4.canExecuteQuery.mockReturnValue(false)
  const sut = createDataProvider([p1, p2, p3, p4])
  try {
    await sut.query({ from: "area" })
  } catch (e) {
    expect(e).toMatchObject(new UnsupportedDomainError("area"))
  }
})

test("can execute query only when matching provider is found", async () => {
  p1.canExecuteQuery.mockReturnValue(false)
  p2.canExecuteQuery.mockReturnValue(false)
  p3.canExecuteQuery.mockReturnValue(false)
  p4.canExecuteQuery.mockReturnValue(false)
  const sut = createDataProvider([p1, p2, p3, p4])
  const actual = sut.canExecuteQuery({ from: "area" })

  expect(actual).toEqual(false)
})
