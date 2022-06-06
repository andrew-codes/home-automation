import createClient from ".."
import { createClient as expectedCreateClient } from "../docker"

test("exports createClient", () => {
  expect(createClient).toEqual(expectedCreateClient)
})
