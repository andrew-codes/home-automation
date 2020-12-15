import { createDataProvider } from "../sql";
import { equality } from "../../filter";
import { QueryParseError } from "../Errors";

const executeQuery = jest.fn();

beforeEach(() => {
  jest.resetAllMocks();
  executeQuery.mockResolvedValueOnce([
    { table_name: "game" },
    { table_name: "home_assistant_area" },
    { table_name: "home_assistant_domain" },
    { table_name: "home_assistant_entity" },
    { table_name: "platform" },
  ]);
});

test("no query is provided", async () => {
  const expected = [{ id: 1 }, { id: 2 }];
  executeQuery.mockResolvedValue(expected);
  const sut = createDataProvider({ executeQuery });

  await expect(() => sut.query()).rejects.toThrow(
    new QueryParseError("query parameter is required")
  );
});

describe("selecting data", () => {
  test("no from is provided", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({});
    expect(actual).toEqual([]);
  });

  test("select all fields from a table", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({ from: "platform" });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith("SELECT * FROM platform;", []);
    expect(actual).toEqual(expected);
  });

  test("select specific fields from a table", async () => {
    const expected = [
      { id: 1, name: "a name" },
      { id: 2, name: "another name" },
    ];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({
      from: "platform",
      select: ["id", "name"],
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith(
      'SELECT id,"name" FROM platform;',
      []
    );
    expect(actual).toEqual(expected);
  });

  test("select specific fields from a table always includes the id", async () => {
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "platform",
      select: ["name"],
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith(
      'SELECT "name",id FROM platform;',
      []
    );
  });

  test("database errors bubble up", async () => {
    executeQuery.mockImplementation(() => {
      throw new Error();
    });
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "platform",
        select: ["id", "name"],
      })
    ).rejects.toEqual(new Error());
  });

  test("returns an array for a single result value", async () => {
    executeQuery.mockReturnValue({ id: "Game:1" });
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({
      from: "platform",
      select: ["id", "name"],
    });
    expect(actual).toEqual([{ id: "Game:1" }]);
  });
});

describe("equality filter", () => {
  describe("single value", () => {
    test("negation false", async () => {
      const sut = createDataProvider({ executeQuery });
      await sut.query({
        from: "platform",
        select: ["id", "name"],
        filters: [equality.filter("id", "Platform:1")],
      });

      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery.mock.calls[1]).toEqual([
        'SELECT id,"name" FROM platform WHERE id = $1;',
        ["Platform:1"],
      ]);
    });

    test("negation true", async () => {
      const sut = createDataProvider({ executeQuery });
      await sut.query({
        from: "platform",
        select: ["id", "name"],
        filters: [equality.filter("id", "Platform:1", true)],
      });

      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery.mock.calls[1]).toEqual([
        'SELECT id,"name" FROM platform WHERE id <> $1;',
        ["Platform:1"],
      ]);
    });
  });

  describe("multi-value", () => {
    test("negation false", async () => {
      const sut = createDataProvider({ executeQuery });
      await sut.query({
        from: "platform",
        select: ["id", "name"],
        filters: [equality.filter("id", ["Platform:1", "Platform:3"])],
      });

      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery.mock.calls[1]).toEqual([
        'SELECT id,"name" FROM platform WHERE id in ($1,$2);',
        ["Platform:1", "Platform:3"],
      ]);
    });

    test("negation true", async () => {
      const sut = createDataProvider({ executeQuery });
      await sut.query({
        from: "platform",
        select: ["id", "name"],
        filters: [equality.filter("id", ["Platform:1", "Platform:3"], true)],
      });
      expect(executeQuery).toHaveBeenCalledTimes(2);
      expect(executeQuery.mock.calls[1]).toEqual([
        'SELECT id,"name" FROM platform WHERE id not in ($1,$2);',
        ["Platform:1", "Platform:3"],
      ]);
    });
  });
});

describe("adding new assets", () => {
  test("no from is provided", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({ act: "new" });
    expect(actual).toEqual([]);
  });

  test("add new assets", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "game",
      act: "new",
      select: ["name", "platformId"],
      values: [
        {
          name: "game 1",
          platformId: "steam",
          ignoredProperty: "I am ignored",
        },
        { name: "game 2", platformId: "playstation" },
      ],
    });

    expect(executeQuery).toHaveBeenCalledTimes(3);
    expect(executeQuery.mock.calls[1]).toEqual([
      `INSERT INTO game (\"name\",platformId) VALUES ($1,$2) ON CONFLICT (id) DO UPDATE SET "name"=$1,platformId=$2 RETURNING \"name\",platformId;`,
      ["game 1", "steam"],
    ]);
    expect(executeQuery.mock.calls[2]).toEqual([
      `INSERT INTO game (\"name\",platformId) VALUES ($1,$2) ON CONFLICT (id) DO UPDATE SET "name"=$1,platformId=$2 RETURNING \"name\",platformId;`,
      ["game 2", "playstation"],
    ]);
  });

  test("add new assets without select", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "game",
        act: "new",
        values: [
          {
            name: "game 1",
            platformId: "steam",
            ignoredProperty: "I am ignored",
          },
          { name: "game 2", platformId: "playstation" },
        ],
      })
    ).rejects.toThrow(
      new QueryParseError("select is required when act is set to a value")
    );
  });

  test("add new assets without values", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "game",
        act: "new",
        select: ["name", "platformId"],
      })
    ).rejects.toThrow(
      new QueryParseError("values are required when act is set to a value")
    );
  });

  test("add new assets with empty set of values", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "game",
        act: "new",
        select: ["name", "platformId"],
        values: [],
      })
    ).rejects.toThrow(
      new QueryParseError("values are required when act is set to a value")
    );
  });
});

describe("updating assets", () => {
  test("no from is provided", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({ act: "set" });
    expect(actual).toEqual([]);
  });

  test("updating asset values with no filters", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "game",
      act: "set",
      select: ["name", "platformId"],
      values: {
        name: "game 1",
        platformId: "steam",
        ignoredProperty: "I am ignored",
      },
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(
      executeQuery
    ).toHaveBeenCalledWith(
      `UPDATE game SET \"name\"=$1,platformId=$2 RETURNING \"name\",platformId;`,
      ["game 1", "steam"]
    );
  });

  test("updating asset values with filters", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "game",
      act: "set",
      select: ["name", "platformId"],
      values: {
        name: "game 1",
        platformId: "steam",
        ignoredProperty: "I am ignored",
      },
      filters: [
        equality.filter("name", "game 2"),
        equality.filter("platform", "playstation"),
      ],
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(
      executeQuery
    ).toHaveBeenCalledWith(
      `UPDATE game SET \"name\"=$1,platformId=$2 WHERE \"name\" = $3 AND platform = $4 RETURNING \"name\",platformId;`,
      ["game 1", "steam", "game 2", "playstation"]
    );
  });

  test("updating asset with no values", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "game",
        act: "set",
        select: ["name", "platformId"],
        filters: [
          equality.filter("name", "game 2"),
          equality.filter("platform", "playstation"),
        ],
      })
    ).rejects.toThrow(
      new QueryParseError("values are required when act is set to a value")
    );
  });

  test("updating asset with no select", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await expect(() =>
      sut.query({
        from: "game",
        act: "set",
        values: {
          name: "game 1",
          platformId: "steam",
          ignoredProperty: "I am ignored",
        },
        filters: [
          equality.filter("name", "game 2"),
          equality.filter("platform", "playstation"),
        ],
      })
    ).rejects.toThrow(
      new QueryParseError("select is required when act is set to a value")
    );
  });
});

test("unrecognizable query", async () => {
  const expected = [{ id: 1 }, { id: 2 }];
  executeQuery.mockResolvedValue(expected);
  const sut = createDataProvider({ executeQuery });

  await expect(() =>
    sut.query({
      from: "game",
      act: "this is not recognized",
    })
  ).rejects.toThrow(new QueryParseError("Unrecognized query"));
});

test("unrecognized domains are not handled", async () => {
  const expected = [{ id: 1 }, { id: 2 }];
  executeQuery.mockResolvedValue(expected);
  const sut = createDataProvider({ executeQuery });

  const actual = await sut.query({
    from: "home_assistant_entity_states",
  });
  expect(actual).toEqual([]);
});

describe("removing assets", () => {
  test("no from is provided", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    const actual = await sut.query({ act: "remove" });
    expect(actual).toEqual([]);
  });

  test("removing all assets (no filters)", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "game",
      act: "remove",
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith(`DELETE FROM game;`, []);
  });

  test("removing matching assets (filters)", async () => {
    const expected = [{ id: 1 }, { id: 2 }];
    executeQuery.mockResolvedValue(expected);
    const sut = createDataProvider({ executeQuery });

    await sut.query({
      from: "game",
      act: "remove",
      filters: [equality.filter("id", 1)],
    });

    expect(executeQuery).toHaveBeenCalledTimes(2);
    expect(executeQuery).toHaveBeenCalledWith(
      `DELETE FROM game WHERE id = $1;`,
      [1]
    );
  });
});
