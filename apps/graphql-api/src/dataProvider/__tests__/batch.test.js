import { createDataProvider } from "../batch";
import { equality } from "../../filter";

const loader = {
  query: jest.fn(),
};

beforeEach(() => {
  jest.clearAllMocks();
});

test("issuing queries that have filters other than an ID equality will not be batched", async () => {
  const sut = createDataProvider({ loader });
  const expectedGame1 = { id: "Game:1" };
  const expectedGame2 = { id: "Game:3" };
  loader.query.mockResolvedValueOnce([expectedGame1, expectedGame2]);

  const game1 = sut.query({
    from: "game",
    filters: [
      equality.filter("id", "Game:1"),
      equality.filter("name", "Nioih"),
    ],
  });
  const game2 = sut.query({
    from: "game",
    filters: [
      equality.filter("id", "Game:3"),
      equality.filter("name", "Nioih 2"),
    ],
  });
  const [[actualGame1, actualGame2]] = await Promise.all([game1, game2]);
  expect(loader.query).toHaveBeenCalledTimes(2);
  expect(actualGame1).toEqual(expectedGame1);
  expect(actualGame2).toEqual(expectedGame2);
});

test("issuing queries that have no not be batched", async () => {
  const sut = createDataProvider({ loader });
  const expectedGame1 = { id: "Game:1" };
  const expectedGame2 = { id: "Game:3" };
  loader.query.mockResolvedValueOnce([expectedGame1, expectedGame2]);

  const game1 = sut.query({
    from: "game",
  });
  const game2 = sut.query({
    from: "game",
  });
  const [[actualGame1, actualGame2]] = await Promise.all([game1, game2]);
  expect(loader.query).toHaveBeenCalledTimes(2);
  expect(actualGame1).toEqual(expectedGame1);
  expect(actualGame2).toEqual(expectedGame2);
});

test("select queries with a single equality filter by a single ID will be batched", async () => {
  const sut = createDataProvider({ loader });
  loader.query.mockResolvedValueOnce([{ id: "Game:1" }, { id: "Game:3" }]);
  const game1 = sut.query({
    from: "game",
    filters: [equality.filter("id", "Game:1")],
  });
  const game2 = sut.query({
    from: "game",
    filters: [equality.filter("id", "Game:3")],
  });
  await Promise.all([game1, game2]);
  expect(loader.query).toHaveBeenCalledTimes(1);
});

test("select queries with a single equality filter by multiple IDs will be batched", async () => {
  const sut = createDataProvider({ loader });
  loader.query.mockResolvedValueOnce([
    { id: "Game:1" },
    { id: "Game:5" },
    { id: "Game:3" },
  ]);
  const game1Query = sut.query({
    from: "game",
    filters: [equality.filter("id", ["Game:1", "Game:5"])],
  });
  const game2Query = sut.query({
    from: "game",
    filters: [equality.filter("id", "Game:3")],
  });
  const [game1Results, game2Results] = await Promise.all([
    game1Query,
    game2Query,
  ]);
  expect(loader.query).toHaveBeenCalledTimes(1);
  expect(game1Results).toEqual([{ id: "Game:1" }, { id: "Game:5" }]);
  expect(game2Results).toEqual({ id: "Game:3" });
});

test("custom batchScheduleFn can be provided", async () => {
  const { schedule, dispatch } = createScheduler();
  const sut = createDataProvider({ loader, batchScheduleFn: schedule });
  loader.query.mockResolvedValue([{ id: "Game:3" }]);

  const game1 = sut.query({
    from: "game",
    filters: [equality.filter("name", "Nioh")],
  });
  const game2 = sut.query({
    from: "game",
    filters: [equality.filter("id", "Game:3")],
  });
  dispatch();
  await Promise.all([game1, game2]);
  expect(loader.query).toHaveBeenCalledTimes(2);
});

test("batched queries that are unsupported by the underlying loader, return an empty result set", async () => {
  const sut = createDataProvider({ loader });
  loader.query.mockResolvedValueOnce([]);
  const game1Query = sut.query({
    from: "game",
    filters: [equality.filter("id", ["Game:1", "Game:5"])],
  });
  const game2Query = sut.query({
    from: "game",
    filters: [equality.filter("id", "Game:3")],
  });
  const [game1Results, game2Results] = await Promise.all([
    game1Query,
    game2Query,
  ]);
  expect(loader.query).toHaveBeenCalledTimes(1);
  expect(game1Results).toEqual([]);
  expect(game2Results).toEqual([]);
});

function createScheduler() {
  let callbacks = [];
  return {
    schedule(callback) {
      callbacks.push(callback);
    },
    dispatch() {
      callbacks.forEach((callback) => callback());
      callbacks = [];
    },
  };
}
