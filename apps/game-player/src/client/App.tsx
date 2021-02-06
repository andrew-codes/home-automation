import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeGrid as Grid } from "react-window"
import { AppBar, Drawer, Toolbar } from "@material-ui/core"

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
)

const App = () => {
  const [open, setOpen] = React.useState(false)
  return (
    <>
      <AppBar position="static">
        <Toolbar></Toolbar>
      </AppBar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <h1>Filters</h1>
      </Drawer>
      <AutoSizer>
        {(height, width) => (
          <Grid
            columnCount={1000}
            columnWidth={100}
            height={500}
            rowCount={1000}
            rowHeight={35}
            width={1000}
          >
            {Cell}
          </Grid>
        )}
      </AutoSizer>
    </>
  )
}

export { App }
