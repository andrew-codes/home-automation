import { registerWithHomeAssistant } from "../actionCreators"
import reducer, { defaultState } from "../reducer"

describe("reducer", () => {
  test("reducer returns initial state", () => {
    const actual = reducer(undefined, registerWithHomeAssistant("service_name"))
    expect(actual).toEqual(defaultState)
  })
})
