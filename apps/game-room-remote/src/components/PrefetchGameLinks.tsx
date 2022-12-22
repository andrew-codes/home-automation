import { FC } from "react"

const PrefetchGameLinks: FC<{ games: { coverImage: string }[] }> = ({
  games,
}) => (
  <>
    {games.map((game) => (
      <link key={game.coverImage} rel="prefetch" href={game.coverImage} />
    ))}
  </>
)

export default PrefetchGameLinks
