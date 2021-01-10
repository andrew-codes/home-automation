import { authorizeMiddleware } from "../authorize"

const token = "123"
const next = jest.fn()
const sut = authorizeMiddleware(token)

beforeEach(() => {
  jest.resetAllMocks()
})

test("requests with no API token invoke next with an Error", () => {
  sut({}, {}, next)
  expect(next.mock.calls[0][0]).toStrictEqual(new Error("Unauthorized"))
})

test("requests with a non-matching API token invokes next with Error", () => {
  sut(
    {
      headers: {
        authorization: "Bearer 1234",
      },
    },
    {},
    next
  )
  expect(next.mock.calls[0][0]).toStrictEqual(new Error("Unauthorized"))
})

test("requests with a matching API token invokes next with no parameters", () => {
  sut(
    {
      headers: {
        authorization: "Bearer 123",
      },
    },
    {},
    next
  )
  expect(next.mock.calls[0]).toEqual([])
})
