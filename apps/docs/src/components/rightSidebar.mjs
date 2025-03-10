import { graphql, useStaticQuery } from "gatsby"
import * as React from "react"
import config from "../../config.mjs"
import { ListItem, Sidebar } from "./styles/Sidebar.mjs"

const SidebarLayout = ({ location }) => {
  const { allMdx } = useStaticQuery(graphql`
    query {
      allMdx {
        edges {
          node {
            fields {
              slug
            }
            tableOfContents
          }
        }
      }
    }
  `)

  let finalNavItems

  if (allMdx.edges !== undefined && allMdx.edges.length > 0) {
    const navItems = allMdx.edges.map((item, index) => {
      let innerItems

      if (item !== undefined) {
        if (
          item.node.fields.slug === location.pathname ||
          config.gatsby.pathPrefix + item.node.fields.slug === location.pathname
        ) {
          if (item.node.tableOfContents.items) {
            innerItems = item.node.tableOfContents.items.map(
              (innerItem, index) => {
                const itemId = innerItem.title
                  ? innerItem.title.replace(/\s+/g, "").toLowerCase()
                  : "#"

                return (
                  <ListItem key={index} to={`#${itemId}`} level={1}>
                    {innerItem.title}
                  </ListItem>
                )
              },
            )
          }
        }
      }
      if (innerItems) {
        finalNavItems = innerItems
      }
    })
  }

  if (finalNavItems && finalNavItems.length) {
    return (
      <Sidebar>
        <ul className={"rightSideBarUL"}>
          <li className={"rightSideTitle"}>CONTENTS</li>
          {finalNavItems}
        </ul>
      </Sidebar>
    )
  } else {
    return (
      <Sidebar>
        <ul></ul>
      </Sidebar>
    )
  }
}

export default SidebarLayout
