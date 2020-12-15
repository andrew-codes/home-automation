import {
  arg,
  objectType,
  mutationField,
  inputObjectType,
  queryField,
  stringArg,
} from "@nexus/schema";
import { isEmpty } from "lodash";
import { Node } from "./node";
import { equality } from "../filter";

export const SpotifyPlaylist = objectType({
  name: "SpotifyPlaylist",
  definition(t) {
    t.implements(Node);
    t.string("name");
    t.string("owner");
    t.string("uri");
  },
});

export const SpotifyPlaylistQuery = queryField("spotifyPlaylist", {
  type: SpotifyPlaylist,
  list: true,
  args: {
    owner: stringArg({ list: true }),
  },
  resolve(root, args, ctx) {
    const query = {
      from: "spotify_playlist",
    };
    if (!isEmpty(args.owner)) {
      query.filters = args.owner.map((owner) =>
        equality.filter("owner", owner)
      );
    }
    return ctx.query(query);
  },
});

export const InputSpotifyList = inputObjectType({
  name: "InputSpotifyPlaylist",
  definition(t) {
    t.string("id");
    t.string("name");
    t.string("owner");
    t.string("uri");
  },
});

export const SpotifyPlaylistMutation = mutationField("spotifyPlaylist", {
  type: SpotifyPlaylist,
  list: true,
  args: {
    playlists: arg({ required: true, list: true, type: InputSpotifyList }),
  },
  async resolve(root, args, ctx) {
    return ctx.query({
      from: "spotify_playlist",
      act: "new",
      select: ["id", "uri", "name", "owner"],
      values: args.playlists,
    });
  },
});

export const ClearSpotifyPlaylistMutation = mutationField(
  "clearSpotifyPlaylist",
  {
    type: SpotifyPlaylist,
    list: true,
    async resolve(root, args, ctx) {
      return ctx.query({ from: "spotify_playlist", act: "remove" });
    },
  }
);
