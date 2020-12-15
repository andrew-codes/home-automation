import { createDataProvider } from "../aggregate";

test("provides query to each provider", async () => {
  const provider1 = { query: jest.fn() };
  const provider2 = { query: jest.fn() };
  const query = { from: "game" };
  const sut = createDataProvider([provider1, provider2]);
  await sut.query(query);
  expect(provider1.query).toHaveBeenCalledTimes(1);
  expect(provider1.query).toHaveBeenCalledWith(query);
  expect(provider2.query).toHaveBeenCalledTimes(1);
  expect(provider2.query).toHaveBeenCalledWith(query);
});

test("merges data from providers with results keyed by id", async () => {
  const provider1 = { query: jest.fn() };
  provider1.query.mockResolvedValue([
    { id: "Game:1", name: "a name" },
    { id: "Game:2" },
  ]);

  const provider2 = { query: jest.fn() };
  provider2.query.mockResolvedValue([
    { id: "Game:1", anotherKey: "another value" },
  ]);

  const sut = createDataProvider([provider1, provider2]);
  const actual = await sut.query({ from: "game" });
  expect(actual).toEqual([
    {
      id: "Game:1",
      name: "a name",
      anotherKey: "another value",
    },
    { id: "Game:2" },
  ]);
});

test("returns an array when a single result is found", async () => {
  const provider1 = { query: jest.fn() };
  provider1.query.mockResolvedValue([{ id: "Game:1", name: "a name" }]);

  const provider2 = { query: jest.fn() };
  provider2.query.mockResolvedValue([
    { id: "Game:1", anotherKey: "another value" },
  ]);

  const sut = createDataProvider([provider1, provider2]);
  const actual = await sut.query({ from: "game" });
  expect(actual).toEqual([
    {
      id: "Game:1",
      name: "a name",
      anotherKey: "another value",
    },
  ]);
});
