import styled from "@emotion/styled"
import * as React from "react"
import config from "../../../config.mjs"
import ClosedSvg from "../images/closed.mjs"
import OpenedSvg from "../images/opened.mjs"
import Link from "../Link.mjs"

const ListItem = styled("li")`
  > div {
    align-items: center;
    display: flex;
    width: 100%;
  }

  > div a {
    flex: 1;
    position: relative;
  }

  > div button {
    height: 48px;
    width: 48px;
  }

  > div button svg path {
    fill: ${({ theme }) => theme.colors.text};
  }
`

const TreeNode = ({
  className = "",
  toggleExpansion,
  expanded,
  url,
  title,
  items,
}) => {
  const isExpanded = expanded[url]

  const toggle = (e) => {
    e.preventDefault()
    e.stopPropagation()
    toggleExpansion(url)
  }

  const hasChildren = items.length !== 0

  let location
  if (typeof document != "undefined") {
    location = document.location
  }
  const active =
    location &&
    (location.pathname === url ||
      location.pathname === config.gatsby.pathPrefix + url)

  const calculatedClassName = `${className} item ${active ? "active" : ""}`

  return (
    <ListItem className={calculatedClassName}>
      {title && (
        <div>
          <Link to={url}>{title}</Link>
          {title && hasChildren ? (
            <button
              onClick={toggle}
              aria-label="collapse"
              className="collapser"
            >
              {isExpanded ? <OpenedSvg /> : <ClosedSvg />}
            </button>
          ) : null}
        </div>
      )}

      {!title || (isExpanded && hasChildren) ? (
        <ul>
          {items.map((item, index) => (
            <TreeNode
              key={item.url + index.toString()}
              toggleExpansion={toggleExpansion}
              expanded={expanded}
              {...item}
            />
          ))}
        </ul>
      ) : null}
    </ListItem>
  )
}

export default TreeNode
