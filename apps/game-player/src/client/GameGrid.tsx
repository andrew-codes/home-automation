import * as React from "react"
import { FixedSizeGrid as Grid } from "react-window"
import { gql, useMutation } from "@apollo/client"
import { groupBy, noop } from "lodash"
import { GameSummary } from "./GameSummary"

const START_GAME = gql`
  mutation START_GAME($id: String!, $platformName: String!) {
    playGameInGameRoom(id: $id, platformName: $platformName) {
      state
    }
  }
`

const getLaneProps = ({
  columnCount,
  gridHeight,
  gridWidth,
  itemCount,
  layout,
  rowCount,
}) => {
  if (layout === "vertical") {
    return {
      columnCount,
      columnWidth: gridWidth / columnCount,
      rowCount: Math.max(Math.ceil(itemCount / columnCount), rowCount),
      rowHeight: gridHeight / rowCount,
    }
  }
  return {
    columnCount: Math.max(Math.ceil(itemCount / rowCount), columnCount),
    columnWidth: gridWidth / columnCount,
    rowCount: rowCount,
    rowHeight: gridHeight / rowCount,
  }
}
const getGameIndex = ({
  columnCount,
  columnIndex,
  rowCount,
  rowIndex,
  layout,
}) => {
  if (layout === "vertical") {
    return rowIndex * columnCount + columnIndex
  }
  return columnIndex * rowCount + rowIndex
}

const GameGrid = ({
  columnCount = 1,
  games = [],
  height,
  layout = "vertical",
  onSelect = noop,
  rowCount = 1,
  width,
}) => {
  const uniqueGames = Object.values(groupBy(games, "name"))
  const GameCell = ({ columnIndex, rowIndex, style }) => {
    const [startGame, { data: startGameData }] = useMutation(START_GAME)

    const gameIndex = getGameIndex({
      columnCount,
      columnIndex,
      rowCount,
      rowIndex,
      layout,
    })

    const games = uniqueGames[gameIndex] as any[]
    if (!games) {
      return null
    }
    const game = games[0]
    if (!game) {
      return null
    }

    return (
      <div style={style}>
        <GameSummary
          game={game}
          onSelect={(evt) => {
            onSelect(evt, game)
            startGame({
              variables: {
                id: game.platform.name === "PC" ? game.playniteId : name,
                platformName: game.platform.name,
              },
            })
          }}
        />
      </div>
    )
  }

  const laneProps = getLaneProps({
    columnCount: columnCount,
    gridHeight: height,
    gridWidth: width,
    itemCount: uniqueGames.length,
    layout: layout,
    rowCount: rowCount,
  })

  return (
    <Grid {...laneProps} height={height} width={width}>
      {GameCell}
    </Grid>
  )
}

export { GameGrid }
