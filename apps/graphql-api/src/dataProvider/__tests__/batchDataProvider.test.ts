import { DomainHomeAssistantEntity, DomainQuery } from "../../Domain"
import { equality } from "../../filter"
import { createDataProvider } from "../batchDataProvider"

const dataProvider = {
  query: jest.fn(),
}

beforeEach(() => {
  jest.resetAllMocks()
})

test("querying for data filtered by an attibute other than ID proxies to the underlying data provider", async () => {
  const sut = createDataProvider(dataProvider)
  const q: DomainQuery<DomainHomeAssistantEntity> = {
    from: "home_assistant_entity",
    filters: [equality("name", "Playstation 4")],
  }
  await sut.query(q)

  expect(dataProvider.query).toHaveBeenCalledWith(q)
})

test("querying for data filtered ONLY by the ID attribute batches the requests", (done) => {
  dataProvider.query.mockResolvedValue([
    {
      id: "media_player.playstation_4",
    },
  ])
  const sut = createDataProvider(dataProvider)

  const q: DomainQuery<DomainHomeAssistantEntity> = {
    from: "home_assistant_entity",
    filters: [equality("id", "media_player.playstation_4")],
  }
  const q2: DomainQuery<DomainHomeAssistantEntity> = {
    from: "home_assistant_entity",
    filters: [equality("id", "media_player.gaming_pc")],
  }
  sut.query(q)
  sut.query(q2)
  process.nextTick(() => {
    expect(dataProvider.query.mock.calls.length).toEqual(0)
    process.nextTick(() => {
      expect(dataProvider.query.mock.calls.length).toEqual(2)
      done()
    })
  })
})
