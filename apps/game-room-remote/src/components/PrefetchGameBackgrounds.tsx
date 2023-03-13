import { Helmet } from "react-helmet"
import { FC } from "react"
import { get } from "lodash/fp"

type Dimensions = {
  height: number
  width: number
}
type PrefetchGameBackgroundsProps = {
  games: {
    coverImage?: string | null | undefined
    backgroundImage?: string | null | undefined
  }[]
  backgroundDimensions: Omit<Dimensions, "width">
  coverDimensions: Dimensions
  mode: "prefetch" | "preload"
}
const PrepareGameMedia: FC<PrefetchGameBackgroundsProps> = ({
  games,
  backgroundDimensions,
  coverDimensions,
  mode,
}) => (
  <Helmet>
    {games.filter(get("backgroundImage")).map(({ backgroundImage }, index) => (
      <link
        rel={mode}
        as="image"
        type="image/webp"
        key={`${backgroundImage}-${index}}`}
        href={`${backgroundImage}?&height=${backgroundDimensions.height}`}
      />
    ))}
    {games.filter(get("coverImage")).map(({ coverImage }, index) => (
      <link
        rel={mode}
        as="image"
        type="image/webp"
        key={`${coverImage}-${index}}`}
        href={`${coverImage}?&height=${coverDimensions.height}&width=${coverDimensions.width}`}
      />
    ))}
  </Helmet>
)

export default PrepareGameMedia
