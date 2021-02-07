import * as React from "react"
import { FixedSizeGrid as Grid } from "react-window"
import { GameSummary } from "./GameSummary"

const GameGrid = ({ columnCount = 1, games = [], height, width }) => {
  const GameCell = ({ columnIndex, rowIndex, style }) => {
    const gameIndex = (rowIndex + 1) * (columnIndex + 1) - 1
    const game = games[gameIndex]
    if (!game) {
      return null
    }

    return (
      <div style={style}>
        <GameSummary game={game} />
      </div>
    )
  }

  return (
    <Grid
      columnCount={columnCount}
      columnWidth={width / columnCount - 5}
      height={height}
      rowCount={Math.ceil(games.length / columnCount)}
      rowHeight={250}
      width={width}
    >
      {GameCell}
    </Grid>
  )
}

export { GameGrid }
