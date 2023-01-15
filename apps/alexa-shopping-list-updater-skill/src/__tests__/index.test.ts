jest.mock("express")
jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createHeartbeat } from "@ha/mqtt-heartbeat"
import type { Express } from "express"
import express from "express"

describe("alexa shopping list updater skill", () => {
  beforeEach(() => {
    jest.mocked(express, { shallow: true }).mockReturnValue({
      get: jest.fn(),
      listen: jest.fn(),
      post: jest.fn(),
    } as unknown as Express)
  })

  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createHeartbeat).toBeCalledWith(
      "alexa-shopping-list-updater-service",
    )
  })
})
