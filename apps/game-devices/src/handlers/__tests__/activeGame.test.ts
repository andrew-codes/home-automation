import handler from "../activeGame"

test("activeGame handler reacts to topics relating to tracking active game state", () => {
  expect(handler.shouldHandle(`playnite/library/game/state`)).toEqual(true)
  expect(
    handler.shouldHandle(`playnite/library/game/123/attributes/1123`),
  ).toEqual(false)
  expect(handler.shouldHandle(`playnite/library/game/attributes`)).toEqual(
    false,
  )
})
