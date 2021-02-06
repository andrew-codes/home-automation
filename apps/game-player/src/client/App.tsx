import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeGrid as Grid } from "react-window"
import { AppBar, Container, Drawer, Toolbar } from "@material-ui/core"

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
      <div
        style={{ height: "calc(100vh - 64px)", width: "calc(100vw - 35px)" }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <Grid
              columnCount={1000}
              columnWidth={100}
              height={height}
              rowCount={1000}
              rowHeight={35}
              width={width}
            >
              {Cell}
            </Grid>
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export { App }
