import { FC } from "react"

const PrefetchGameLinks: FC<{ games: { id; coverImage }[] }> = ({ games }) => (
  <>
    {games.map((game) => (
      <link
        key={game.id}
        rel="prefetch"
        href={`http://gaming-assets-web/${game.id}/${
          game.coverImage?.split("\\")[1]
        }`}
      />
    ))}
  </>
)

export default PrefetchGameLinks
