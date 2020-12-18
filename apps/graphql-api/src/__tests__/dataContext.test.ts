jest.mock("../dataProvider/switchDataProvider")
jest.mock("..//dataProvider/homeAssistant/queryHomeAssistantEntities")
jest.mock("../dataProvider/configData/queryArea")
jest.mock("../dataProvider/configData/queryEntityDomain")
import { createDataContext } from "../dataContext"
import { createDataProvider as createSwitchDataProvider } from "../dataProvider/switchDataProvider"
import { createDataProvider as createHomeAssistantAPIEntityDataProvider } from "../dataProvider/homeAssistant/queryHomeAssistantEntities"
import { createDataProvider as createAreaConfigDataProvider } from "../dataProvider/configData/queryArea"
import { createDataProvider as createDomainConfigProvider } from "../dataProvider/configData/queryEntityDomain"

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
beforeEach(() => {
  jest.resetAllMocks()

  ha = jest.fn()
  createSwitchDataProvider.mockReturnValue(switchProvider)
  createHomeAssistantAPIEntityDataProvider.mockReturnValue(haEntityProvider)
  createAreaConfigDataProvider.mockReturnValue(areaProvider)
  createDomainConfigProvider.mockReturnValue(domainProvider)
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
