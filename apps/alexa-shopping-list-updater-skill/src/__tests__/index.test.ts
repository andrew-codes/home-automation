jest.mock("express")
jest.mock("@ha/mqtt-heartbeat")
import run from "../"
import { createMqttHeartbeat } from "@ha/mqtt-heartbeat"
import type { Express } from "express"
import express from "express"

describe("alexa shopping list updater skill", () => {
  beforeEach(() => {
    jest.mocked(express, true).mockReturnValue({
      get: jest.fn(),
      listen: jest.fn(),
      post: jest.fn(),
    } as unknown as Express)
  })

  test("sets up a heartbeat health check", async () => {
    await run()

    expect(createMqttHeartbeat).toBeCalledWith(
      "home/alexa-shopping-list-updater/hearbeat/request",
      "home/alexa-shopping-list-updater/hearbeat/response",
    )
  })
})
