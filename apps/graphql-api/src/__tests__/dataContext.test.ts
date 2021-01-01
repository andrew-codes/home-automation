jest.mock("../dataProvider/switchDataProvider")
jest.mock("..//dataProvider/homeAssistant/queryHomeAssistantEntities")
jest.mock("../dataProvider/configData/queryArea")
jest.mock("../dataProvider/gameDataProvider")
jest.mock("../dataProvider/configData/queryEntityDomain")
jest.mock("../dataProvider/mongoCollectionDataProvider")
import { createDataContext } from "../dataContext"
import { createDataProvider as createAreaConfigDataProvider } from "../dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "../dataProvider/configData/queryEntityDomain"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "../dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createGameDataProvider } from "../dataProvider/gameDataProvider"
import { createDataProvider as createMongoCollectionDataProvider } from "../dataProvider/mongoCollectionDataProvider"
import { createDataProvider as createSwitchDataProvider } from "../dataProvider/switchDataProvider"

let ha
const switchProvider = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const haEntityProvider = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const areaProvider = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const domainProvider = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameProvider = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameCover = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameArtwork = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameGenre = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameCollection = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameFranchise = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameMultiplayerModes = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gamePlayerPerspective = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}
const gameKeyword = {
  canExecuteQuery: jest.fn(),
  query: jest.fn(),
}

const mongoProviderMap = {
  "game_cover.covers": gameCover,
  "game_artwork.artworks": gameArtwork,
  "game_genre.genres": gameGenre,
  "game_collection.collections": gameCollection,
  "game_franchise.franchises": gameFranchise,
  "game_multiplayer_mode.multiplayerModes": gameMultiplayerModes,
  "game_player_perspective.playerPerspectives": gamePlayerPerspective,
  "game_keyword.keywords": gameKeyword,
}

beforeEach(() => {
  jest.resetAllMocks()

  ha = jest.fn()
  createSwitchDataProvider.mockReturnValue(switchProvider)
  createHomeAssistantAPIEntityDataProvider.mockReturnValue(haEntityProvider)
  createAreaConfigDataProvider.mockReturnValue(areaProvider)
  createDomainConfigProvider.mockReturnValue(domainProvider)
  createGameDataProvider.mockReturnValue(gameProvider)
  createMongoCollectionDataProvider.mockImplementation((domain, collection) => {
    console.log(domain, collection)
    return mongoProviderMap[`${domain}.${collection}`]
  })
})

test("data context contains HA instance", () => {
  const sut = createDataContext(ha)
  expect(sut.ha).toEqual(ha)
})

test("combines domains in a switch provider", async () => {
  const sut = createDataContext(ha)
  expect(createSwitchDataProvider).toHaveBeenCalledWith([
    areaProvider,
    haEntityProvider,
    domainProvider,
    gameProvider,
    gameCover,
    gameArtwork,
    gameGenre,
    gameCollection,
    gameFranchise,
    gameMultiplayerModes,
    gamePlayerPerspective,
    gameKeyword,
  ])
  switchProvider.query.mockResolvedValue({ id: "lights", name: "Lights" })

  const actual = await sut.query({ from: "area" })
  expect(switchProvider.query).toHaveBeenCalledWith({ from: "area" })
  expect(actual).toEqual({ id: "lights", name: "Lights" })

  sut.canExecuteQuery({ from: "area" })
  expect(switchProvider.canExecuteQuery).toHaveBeenCalledWith({ from: "area" })
})

test("errors from providers return empty result set", async () => {
  switchProvider.query.mockImplementation(() => {
    throw new Error()
  })
  const sut = createDataContext(ha)
  const actual = await sut.query({ from: "area" })
  expect(actual).toEqual([])
})
