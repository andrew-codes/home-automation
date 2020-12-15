import {
  objectType,
  mutationField,
  stringArg,
  queryField,
} from "@nexus/schema";
import { Node } from "./node";

export const SpotifyCredentials = objectType({
  name: "SpotifyCredentials",
  definition(t) {
    t.implements(Node);
    t.string("refresh_token");
    t.string("spotify_id");
  },
});

export const spotifyCredentialsQuery = queryField("spotifyCredentials", {
  list: true,
  type: SpotifyCredentials,
  async resolve(root, args, ctx) {
    return ctx.query({
      from: "spotify_credentials",
    });
  },
});

export const SpotifyCredentialsMutation = mutationField("spotifyCredentials", {
  type: SpotifyCredentials,
  args: {
    username: stringArg({ required: true }),
    refresh_token: stringArg({ required: true }),
    spotify_id: stringArg({ required: true }),
  },
  async resolve(root, args, ctx) {
    return ctx.query({
      from: "spotify_credentials",
      act: "new",
      select: ["id", "refresh_token", "spotify_id"],
      values: {
        id: args.username,
        refresh_token: args.refresh_token,
        spotify_id: args.spotify_id,
      },
    });
  },
});
