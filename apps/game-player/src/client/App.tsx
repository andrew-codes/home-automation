import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import { FixedSizeGrid as Grid } from "react-window"
import { AppBar, Box, Drawer, makeStyles, Tab, Tabs } from "@material-ui/core"

const Cell = ({ columnIndex, rowIndex, style }) => (
  <div style={style}>
    Item {rowIndex},{columnIndex}
  </div>
)

const TabPanel = ({ children, index, value, ...rest }) => (
  <div
    role="tabpanel"
    hidden={value !== index}
    id={`game-tabpanel-${index}`}
    aria-labelledby={`game-tab-${index}`}
    {...rest}
  >
    {value === index && <Box p={3}>{children}</Box>}
  </div>
)

const App = () => {
  const [open, setOpen] = React.useState(false)

  const [tabIndex, setTabIndex] = React.useState(0)
  const handleTabIndexChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  return (
    <>
      <AppBar position="static">
        <Tabs
          aria-label="Game Tabs"
          onChange={handleTabIndexChange}
          value={tabIndex}
        >
          <Tab label="Recent"></Tab>
          <Tab label="All"></Tab>
        </Tabs>
      </AppBar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <h1>Filters</h1>
      </Drawer>
      <div
        style={{ height: "calc(100vh - 64px)", width: "calc(100vw - 35px)" }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <>
              <TabPanel value={tabIndex} index={0}>
                <Grid
                  columnCount={5}
                  columnWidth={100}
                  height={height}
                  rowCount={3}
                  rowHeight={35}
                  width={width}
                >
                  {Cell}
                </Grid>
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
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
              </TabPanel>
            </>
          )}
        </AutoSizer>
      </div>
    </>
  )
}

export { App }
