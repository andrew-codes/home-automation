import { Helmet } from "react-helmet"
import { FC } from "react"

type PrefetchGameBackgroundsProps = {
  games: { backgroundImage?: string | null | undefined }[]
  height: number
}
const PrefetchGameBackgrounds: FC<PrefetchGameBackgroundsProps> = ({
  games,
  height,
}) => (
  <Helmet>
    {games.map(({ backgroundImage }, index) => (
      <link
        rel="prefetch"
        as="image"
        type="image/webp"
        key={`${backgroundImage}-${index}}`}
        href={`${backgroundImage}?&height=${height}`}
      />
    ))}
  </Helmet>
)

export default PrefetchGameBackgrounds
