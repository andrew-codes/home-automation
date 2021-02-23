import * as React from "react"
import AutoSizer from "react-virtualized-auto-sizer"
import {
  AppBar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  makeStyles,
  Tab,
  Tabs,
} from "@material-ui/core"
import { PowerOff } from "@material-ui/icons"
import { gql, useMutation, useQuery } from "@apollo/client"
import { merge, noop } from "lodash"
import { GameGrid } from "./GameGrid"
import { GameSummary, query as gameQuery } from "./GameSummary"

const GET_GAMES = gql`
  query {
    game(orderBy: { name: asc }) {
      playniteId
      releaseYear
      favorite
      hidden
      summary
      platform {
        name
      }
      state
      ...GameSummary
    }
  }
  ${gameQuery}
`
const GAME_STATE_UPDATES = gql`
  subscription {
    gameState {
      playniteId
      state
    }
  }
`

const STOP_GAME = gql`
  mutation {
    stopGameInGameRoom {
      playniteId
    }
  }
`

const useStyles = makeStyles((theme) => ({
  activeGameDialogRoot: {
    display: "flex",
    height: "100%",
    width: "100%",
  },
  activeGameDialogGameSummaryRoot: {
    width: "750px",
  },
  activeGameDialogGameSummaryText: {
    margin: "32px",
    width: "100%",
  },
  paper: {
    height: "80vh",
  },
  powerButton: {
    flexGrow: 1,
    textAlign: "right",
  },
}))

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

const Loading = () => <div>Loading...</div>

const App = () => {
  const classes = useStyles()

  const [open, setOpen] = React.useState(false)

  const [tabIndex, setTabIndex] = React.useState(0)
  const handleTabIndexChange = (event, newValue) => {
    setTabIndex(newValue)
  }

  const [stopGame] = useMutation(STOP_GAME)

  const { loading, data, error, subscribeToMore } = useQuery(GET_GAMES)
  React.useEffect(() => {
    subscribeToMore({
      document: GAME_STATE_UPDATES,
      updateQuery: (prev, { subscriptionData }) => {
        const newGames = merge({}, prev)
        if (!subscriptionData.data.gameState) {
          const gameIndex = newGames.game.findIndex(
            ({ state }) => state === "Launching" || state === "Running"
          )
          if (gameIndex < 0) {
            return
          }
          newGames.game[gameIndex].state = "Installed"
          return newGames
        }
        const updatedGame = subscriptionData.data.gameState
        const gameIndex = newGames.game.findIndex(
          (game) => game.playniteId === updatedGame.playniteId
        )
        newGames.game[gameIndex].state = updatedGame.state
        return newGames
      },
    })
  }, [])

  return (
    <>
      <AppBar position="static">
        <Tabs
          aria-label="Game Tabs"
          onChange={handleTabIndexChange}
          value={tabIndex}
        >
          <Tab label="Favorites"></Tab>
          <Tab label="All"></Tab>
          <div className={classes.powerButton}>
            <IconButton>
              <PowerOff style={{ color: "#fff" }} />
            </IconButton>
          </div>
        </Tabs>
      </AppBar>
      <Drawer anchor="right" open={open} onClose={() => setOpen(false)}>
        <h1>Filters</h1>
      </Drawer>
      <div
        style={{ height: "calc(100vh - 96px)", width: "calc(100vw - 35px)" }}
      >
        <AutoSizer>
          {({ height, width }) => (
            <>
              <TabPanel value={tabIndex} index={0}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={4}
                    games={data?.game.filter((game) => game.favorite)}
                    height={height}
                    layout="horizontal"
                    rowCount={3}
                    width={width}
                  />
                )}
              </TabPanel>
              <TabPanel value={tabIndex} index={1}>
                {loading ? (
                  <Loading />
                ) : (
                  <GameGrid
                    columnCount={5}
                    games={data?.game}
                    height={height}
                    layout="horizontal"
                    rowCount={4}
                    width={width}
                  />
                )}
              </TabPanel>
            </>
          )}
        </AutoSizer>
        <Dialog
          disableBackdropClick
          disableEscapeKeyDown
          maxWidth="lg"
          fullWidth={true}
          aria-labelledby="game-playing-confirmation-dialog-title"
          open={
            !!data?.game.find(
              ({ state }) => state === "Launching" || state === "Running"
            )
          }
          classes={{
            paper: classes.paper,
          }}
        >
          <DialogTitle id="game-playing-confirmation-dialog-title">
            Active Game
          </DialogTitle>
          <DialogContent>
            {!!data?.game.find(
              ({ state }) => state === "Launching" || state === "Running"
            ) && (
              <div className={classes.activeGameDialogRoot}>
                <GameSummary
                  classes={{ root: classes.activeGameDialogGameSummaryRoot }}
                  game={data?.game.find(
                    ({ state }) => state === "Launching" || state === "Running"
                  )}
                  onSelect={noop}
                />
                <p className={classes.activeGameDialogGameSummaryText}>
                  {
                    data?.game.find(
                      ({ state }) =>
                        state === "Launching" || state === "Running"
                    )?.summary
                  }
                </p>
              </div>
            )}
          </DialogContent>
          <DialogActions>
            <Button autoFocus onClick={(evt) => stopGame()} color="primary">
              Stop Game
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </>
  )
}

export { App }
