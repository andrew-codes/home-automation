import * as React from "react"
import config from "../../../config.mjs"
import ClosedSvg from "../images/closed.mjs"
import OpenedSvg from "../images/opened.mjs"
import Link from "../Link.mjs"

const TreeNode = ({
  className = "",
  setCollapsed,
  collapsed,
  url,
  title,
  items,
  ...rest
}) => {
  const isCollapsed = collapsed[url]

  const collapse = () => {
    setCollapsed(url)
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
    <li className={calculatedClassName}>
      {title && (
        <Link to={url}>
          {title}
          {!config.sidebar.frontLine && title && hasChildren ? (
            <button
              onClick={collapse}
              aria-label="collapse"
              className="collapser"
            >
              {!isCollapsed ? <OpenedSvg /> : <ClosedSvg />}
            </button>
          ) : null}
        </Link>
      )}

      {!isCollapsed && hasChildren ? (
        <ul>
          {items.map((item, index) => (
            <TreeNode
              key={item.url + index.toString()}
              setCollapsed={setCollapsed}
              collapsed={collapsed}
              {...item}
            />
          ))}
        </ul>
      ) : null}
    </li>
  )
}

export default TreeNode
