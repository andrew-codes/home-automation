jest.mock("../../ha");
import { ha } from "../../ha";
import { createDataProvider } from "../homeAssistant";
import { equality } from "../../filter";

beforeEach(() => {
  jest.clearAllMocks();
});

test("disallowed domains are not queryable and return an empty result set", async () => {
  const sut = createDataProvider();

  await sut.query({ from: "home_assistant_entity" });
  expect(ha.states.list).toHaveBeenCalledTimes(0);
  await sut.query({ from: "home_assistant_area" });
  expect(ha.states.list).toHaveBeenCalledTimes(0);
  await sut.query({ from: "home_assistant_domain" });
  expect(ha.states.list).toHaveBeenCalledTimes(0);
  await sut.query({ from: "game" });
  expect(ha.states.list).toHaveBeenCalledTimes(0);
  await sut.query({ from: "platform" });
  expect(ha.states.list).toHaveBeenCalledTimes(0);
});

test("querying entity states uses the HA connector", async () => {
  ha.states.list.mockResolvedValue([
    {
      entity_id: "media_player.playstation_4",
      state: "playing",
      attributes: {
        source_list: ["FF7", "Nioh 2"],
      },
    },
    {
      entity_id: "media_player.steam",
      state: "off",
    },
  ]);
  const sut = createDataProvider();
  const actual = await sut.query({ from: "home_assistant_entity_states" });
  expect(ha.states.list).toHaveBeenCalledTimes(1);
  expect(actual).toEqual([
    {
      id: "media_player.playstation_4",
      state: "playing",
      attributes: {
        source_list: ["FF7", "Nioh 2"],
      },
    },
    { id: "media_player.steam", state: "off" },
  ]);
});

describe("filtering", () => {
  test("unsupported filters are ignored", async () => {
    ha.states.list.mockResolvedValue([
      {
        entity_id: "media_player.nintendo_switch",
        state: "off",
      },
      {
        entity_id: "media_player.playstation_4",
        state: "playing",
        attributes: {
          source_list: ["FF7", "Nioh 2"],
        },
      },
      {
        entity_id: "media_player.steam",
        state: "off",
      },
    ]);
    const sut = createDataProvider();
    const actual = await sut.query({
      from: "home_assistant_entity_states",
      filters: [
        equality.filter("state", "playing", true),
        { type: "unsupported" },
      ],
    });
    expect(actual).toEqual([
      {
        id: "media_player.nintendo_switch",
        state: "off",
      },
      {
        id: "media_player.steam",
        state: "off",
      },
    ]);
  });

  test("no supported filters returns all results", async () => {
    ha.states.list.mockResolvedValue([
      {
        entity_id: "media_player.nintendo_switch",
        state: "off",
      },
      {
        entity_id: "media_player.playstation_4",
        state: "playing",
        attributes: {
          source_list: ["FF7", "Nioh 2"],
        },
      },
      {
        entity_id: "media_player.steam",
        state: "off",
      },
    ]);
    const sut = createDataProvider();
    const actual = await sut.query({
      from: "home_assistant_entity_states",
      filters: [{ type: "unsupported" }],
    });
    expect(actual).toEqual([
      {
        id: "media_player.nintendo_switch",
        state: "off",
      },
      {
        id: "media_player.playstation_4",
        state: "playing",
        attributes: {
          source_list: ["FF7", "Nioh 2"],
        },
      },
      {
        id: "media_player.steam",
        state: "off",
      },
    ]);
  });

  describe("equality", () => {
    test("querying state based on equality filter", async () => {
      ha.states.list.mockResolvedValue([
        {
          entity_id: "media_player.playstation_4",
          state: "playing",
          attributes: {
            source_list: ["FF7", "Nioh 2"],
          },
        },
        {
          entity_id: "media_player.steam",
          state: "off",
        },
      ]);
      const sut = createDataProvider();
      const actual = await sut.query({
        from: "home_assistant_entity_states",
        filters: [equality.filter("state", "playing")],
      });
      expect(actual).toEqual([
        {
          id: "media_player.playstation_4",
          state: "playing",
          attributes: {
            source_list: ["FF7", "Nioh 2"],
          },
        },
      ]);
    });

    test("querying state based on negated equality filter", async () => {
      ha.states.list.mockResolvedValue([
        {
          entity_id: "media_player.nintendo_switch",
          state: "off",
        },
        {
          entity_id: "media_player.playstation_4",
          state: "playing",
          attributes: {
            source_list: ["FF7", "Nioh 2"],
          },
        },
        {
          entity_id: "media_player.steam",
          state: "off",
        },
      ]);
      const sut = createDataProvider();
      const actual = await sut.query({
        from: "home_assistant_entity_states",
        filters: [equality.filter("state", "playing", true)],
      });
      expect(actual).toEqual([
        {
          id: "media_player.nintendo_switch",
          state: "off",
        },
        {
          id: "media_player.steam",
          state: "off",
        },
      ]);
    });
  });
});
