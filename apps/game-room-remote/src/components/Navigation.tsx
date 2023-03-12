import { useEffect } from "react"
import styled from "styled-components"
import { LeftSidebar } from "@atlaskit/page-layout"
import {
  NavigationContent,
  Section as AtlasSection,
  SideNavigation,
} from "@atlaskit/side-navigation"
import Text from "./Text"
import { gql } from "../generated"
import { useQuery } from "@apollo/client"

const query = gql(/* GraphQL */ `
  query Navigation {
    areas {
      id
      activity {
        release {
          game {
            name
            coverImage
          }
        }
        isRunning
        isLaunching
      }
    }
  }
`)

const Sidebar = styled.div`
  height: 100%;
  --ds-surface: var(--side-bar-color);
`
const NavBorder = styled(Sidebar)`
  border-right: 1px solid var(--border-color);
`

const NavLayout = styled.div`
  height: 100% !important;
  flex-direction: column;
  display: flex;
  background: var(--side-bar-color);
  > * {
    height: unset !important;
  }
  > *:last-child {
    flex: 1;
  }
`

const Section = styled(AtlasSection)`
  margin: 18px;
`

const NowPlayingSummary = styled.div`
  min-height: 64px;
  padding: 18px;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  display: flex;

  img {
    height: 64px;
    width: 64px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
  > *:not(img) {
    padding-top: 12px;
    padding-left: 18px;
  }
`

const Navigation = ({ children, cdnHost }) => {
  useEffect(() => {
    if (window.innerWidth < 600) {
      const dsPageLayoutState: any =
        JSON.parse(localStorage.getItem("DS_PAGE_LAYOUT_UI_STATE") ?? "{}") ??
        {}

      dsPageLayoutState.isLeftSidebarCollapsed = true
      dsPageLayoutState.gridState.leftSidebarWidth = 20
      localStorage.setItem(
        "DS_PAGE_LAYOUT_UI_STATE",
        JSON.stringify(dsPageLayoutState),
      )
    }
  }, [])

  const areaId = "game_room"
  const { data } = useQuery(query)
  const area = data?.areas.find(({ id }) => id === areaId)

  return (
    <NavBorder>
      <LeftSidebar width={350} collapsedState="collapsed">
        <SideNavigation label="Game Room Navigation">
          <NavLayout>
            <NavigationContent>
              <Section>
                {!!area && (
                  <NowPlayingSummary>
                    <img
                      src={`${cdnHost}/${area.activity?.release.game.coverImage}`}
                      alt={`Cover are of active game`}
                    />
                    <Text as="span">{area.activity?.release.game.name}</Text>
                  </NowPlayingSummary>
                )}
              </Section>
              {children}
            </NavigationContent>
          </NavLayout>
        </SideNavigation>
      </LeftSidebar>
    </NavBorder>
  )
}

export default Navigation
export { Section }
