import * as React from "react"
import { makeStyles, Theme } from "@material-ui/core"
import { noop } from "lodash"

const useGameCellStyles = makeStyles<Theme, { game: any }>({
  root: {
    height: "100%",
    padding: "8px",
  },
  coverArt: {
    backgroundImage: ({ game }) =>
      `url(http://192.168.1.45:30517/image/${game.cover.id})`,
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
})

const GameSummary = ({ game, onSelect = noop }) => {
  const classes = useGameCellStyles({ game })

  return (
    <div className={classes.root} onClick={onSelect}>
      <div className={classes.coverArt}>
        <div className={classes.details}>{game.name}</div>
      </div>
    </div>
  )
}

export { GameSummary }
