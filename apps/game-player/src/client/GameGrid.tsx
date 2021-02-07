import * as React from "react"
import { FixedSizeGrid as Grid } from "react-window"

const GameGrid = ({ columnCount = 1, games = [], height, width }) => {
  const GameCell = ({ columnIndex, rowIndex, style }) => {
    const gameIndex = (rowIndex + 1) * (columnIndex + 1) - 1

    if (gameIndex > games.length) {
      return null
    }
    const game = games[gameIndex]
    return (
      <div style={style}>
        {game?.name}
        <br />
        {game?.playniteId}
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
