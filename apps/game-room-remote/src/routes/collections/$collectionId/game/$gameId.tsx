import { json, LoaderArgs } from "@remix-run/node"
import { Game } from "../../../../Game"
import fetchGames from "../../../../api/fetchGames.server"
import GameOverview from "../../../../components/GameOverview"
import useLoaderData from "../../../../useLoaderData"

export const loader = async (args: LoaderArgs) => {
  const id = args.params.gameId
  if (!id) {
    throw new Error("No Game ID provided.")
  }
  const [game] = await fetchGames([id])

  return json<{ data: { cdnHost: string; game: Game } }>({
    data: {
      cdnHost: process.env.GAMING_ASSETS_WEB_HOST ?? "",
      game,
    },
  })
}

export default function SelectedGame() {
  const {
    data: { cdnHost, game },
  } = useLoaderData<typeof loader>()

  return <GameOverview {...game} cdnHost={cdnHost} />
}
