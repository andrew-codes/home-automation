import * as React from "react"
import { Chip, makeStyles, StyledProps, Theme } from "@material-ui/core"
import { gql } from "@apollo/client"
import { noop } from "lodash"

const useGameCellStyles = makeStyles<
  Theme,
  {
    game: Game
  }
>({
  root: {
    height: "100%",
    padding: "8px",
    position: "relative",
  },
  coverArt: {
    backgroundImage: ({ game }) => `url(http://${game.cover.url})`,
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    display: "flex",
    flexDirection: "row",
    height: "100%",
  },
  details: {
    alignSelf: "flex-end",
    background: "#fff",
    opacity: 0.85,
    padding: "8px",
    width: "100%",
  },
  platform: {
    position: "absolute",
    top: 0,
    right: 0,
  },
})

const PlatformIcon: React.FunctionComponent<{ platformName: string }> = ({
  platformName,
}) => (
  <Chip
    color="primary"
    label={
      platformName === "Sony PlayStation 5"
        ? "PS5"
        : platformName === "Sony PlayStation 4"
        ? "PS4"
        : platformName === "Sony PlayStation 3"
        ? "PS3"
        : "PC"
    }
  />
)

const query = gql`
  fragment GameSummary on Game {
    cover {
      url
    }
    name
    platform {
      name
    }
  }
`

type Game = {
  cover: { url: string }
  name: string
  platform: {
    name: string
  }
}
type Props = {
  classes?: {
    root?: string
  }
  game: Game
  onSelect: (evt: React.FormEvent) => void
}
const GameSummary: React.FunctionComponent<Props> = ({
  game,
  onSelect = noop,
  ...rest
}) => {
  const classes = useGameCellStyles({ game })

  return (
    <div
      className={`${classes.root} ${rest?.classes?.root}`}
      onClick={onSelect}
    >
      <div className={classes.coverArt}>
        <div className={classes.details}>{game.name}</div>
      </div>
      <div className={classes.platform}>
        <PlatformIcon platformName={game.platform.name} />
      </div>
    </div>
  )
}

export { query, GameSummary }
