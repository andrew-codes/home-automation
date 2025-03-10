import styled from "@emotion/styled"
import { graphql, useStaticQuery } from "gatsby"
import * as React from "react"
import GitHubButton from "react-github-btn"
import Loadable from "react-loadable"
import config from "../../config.mjs"
import { DarkModeSwitch } from "./DarkModeSwitch.mjs"
import help from "./images/help.svg"
import logoImg from "./images/logo.png"
import twitter from "./images/twitter.svg"
import Link from "./Link.mjs"
import LoadingProvider from "./mdxComponents/loading.mjs"

const isSearchEnabled =
  config.header.search && config.header.search.enabled ? true : false

let searchIndices = []

if (isSearchEnabled && config.header.search.indexName) {
  searchIndices.push({
    name: `${config.header.search.indexName}`,
    title: `Results`,
    hitComp: `PageHit`,
  })
}

const LoadableComponent = Loadable({
  loader: () => import("./search/index.mjs"),
  loading: LoadingProvider,
})

function myFunction() {
  var x = document.getElementById("navbar")

  if (x.className === "topnav") {
    x.className += " responsive"
  } else {
    x.className = "topnav"
  }
}

const StyledBgDiv = styled("div")`
  height: 60px;
  box-shadow: 0 3px 6px 0 rgba(0, 0, 0, 0.16);
  background-color: #f8f8f8;
  position: relative;
  display: none;
  background: ${(props) => (props.isDarkThemeActive ? "#001932" : undefined)};

  @media (max-width: 767px) {
    display: block;
  }
`

const Logo = styled("img")`
  display: inline;
  width: 48px;
  height: 48px;
  padding: 4px;
  border-radius: 50%;
  background-color: #fff;
`

const NavbarHeader = styled("div")`
  > * {
    margin-left: 16px;
  }
  > *:first-child {
    margin-left: 0;
  }
`

const Header = ({ location, isDarkThemeActive, toggleActiveTheme }) => {
  const data = useStaticQuery(graphql`
    query headerTitleQuery {
      site {
        siteMetadata {
          headerTitle
          githubUrl
          helpUrl
          tweetText
          logo {
            link
            image
          }
          headerLinks {
            link
            text
          }
        }
      }
    }
  `)
  const {
    site: {
      siteMetadata: {
        headerTitle,
        githubUrl,
        helpUrl,
        tweetText,
        logo,
        headerLinks,
      },
    },
  } = data

  const finalLogoLink = logo.link

  return (
    <div className={"navBarWrapper"}>
      <nav className={"navBarDefault"}>
        <NavbarHeader className={"navBarHeader"}>
          <Link to={finalLogoLink} className={"navBarBrand"}>
            <Logo
              className={"img-responsive displayInline"}
              src={logo.image !== "" ? logo.image : logoImg}
              alt={"logo"}
            />
          </Link>
          <div
            className={"headerTitle displayInline"}
            dangerouslySetInnerHTML={{ __html: headerTitle }}
          />
        </NavbarHeader>
        {config.header.social ? (
          <ul
            className="socialWrapper visibleMobileView"
            dangerouslySetInnerHTML={{ __html: config.header.social }}
          ></ul>
        ) : null}
        {isSearchEnabled ? (
          <div className={"searchWrapper hiddenMobile navBarUL"}>
            <LoadableComponent collapse={true} indices={searchIndices} />
          </div>
        ) : null}
        <div id="navbar" className={"topnav"}>
          <div className={"visibleMobile"}>
            {/* <Sidebar location={location} /> */}
            <hr />
          </div>
          <ul className={"navBarUL navBarNav navBarULRight"}>
            {headerLinks.map((link, key) => {
              if (link.link !== "" && link.text !== "") {
                return (
                  <li key={key}>
                    <a
                      className="sidebarLink"
                      href={link.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      dangerouslySetInnerHTML={{ __html: link.text }}
                    />
                  </li>
                )
              }
            })}
            {helpUrl !== "" ? (
              <li>
                <a href={helpUrl}>
                  <img src={help} alt={"Help icon"} />
                </a>
              </li>
            ) : null}

            {tweetText !== "" ? (
              <li>
                <a
                  href={"https://twitter.com/intent/tweet?&text=" + tweetText}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <img className={"shareIcon"} src={twitter} alt={"Twitter"} />
                </a>
              </li>
            ) : null}
            {tweetText !== "" || githubUrl !== "" ? (
              <li className="divider hiddenMobile"></li>
            ) : null}
            {config.header.social ? (
              <li className={"hiddenMobile"}>
                <ul
                  className="socialWrapper"
                  dangerouslySetInnerHTML={{
                    __html: config.header.social,
                  }}
                ></ul>
              </li>
            ) : null}
            {githubUrl !== "" ? (
              <li className={"githubBtn"}>
                <GitHubButton
                  href={githubUrl}
                  data-show-count="true"
                  aria-label="Star on GitHub"
                >
                  Star
                </GitHubButton>
              </li>
            ) : null}
            <li>
              <DarkModeSwitch
                isDarkThemeActive={isDarkThemeActive}
                toggleActiveTheme={toggleActiveTheme}
              />
            </li>
          </ul>
        </div>
      </nav>
      <StyledBgDiv isDarkThemeActive={isDarkThemeActive}>
        <div className={"navBarDefault removePadd"}>
          <span
            onClick={myFunction}
            className={"navBarToggle"}
            onKeyDown={myFunction}
            role="button"
            tabIndex={0}
          >
            <span className={"iconBar"}></span>
            <span className={"iconBar"}></span>
            <span className={"iconBar"}></span>
          </span>
        </div>
        {isSearchEnabled ? (
          <div className={"searchWrapper"}>
            <LoadableComponent collapse={true} indices={searchIndices} />
          </div>
        ) : null}
      </StyledBgDiv>
    </div>
  )
}

export default Header
