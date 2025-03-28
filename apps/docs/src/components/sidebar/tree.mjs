import { merge } from "lodash-es"
import React, { useMemo, useState } from "react"
import config from "../../../config.mjs"
import TreeNode from "./treeNode.mjs"

const calculateTreeData = (edges) => {
  const originalData = config.sidebar.ignoreIndex
    ? edges.filter(
        ({
          node: {
            fields: { slug },
          },
        }) => slug !== "/",
      )
    : edges

  const tree = originalData.reduce(
    (
      accu,
      {
        node: {
          fields: { slug, title },
        },
      },
    ) => {
      const parts = slug.split("/")

      let { items: prevItems } = accu

      const slicedParts = parts.slice(1, -1)

      for (const part of slicedParts) {
        let tmp = prevItems && prevItems.find(({ label }) => label == part)
        if (tmp) {
          if (!tmp.items) {
            tmp.items = []
          }
        } else {
          tmp = { label: part, items: [], url: slug, title }
          prevItems.push(tmp)
          return accu
        }
        prevItems = tmp.items
      }
      const slicedLength = parts.length - 1

      const existingItem = prevItems.find(
        ({ label }) => label === parts[slicedLength],
      )

      if (existingItem) {
        existingItem.url = slug
        existingItem.title = title
      } else {
        prevItems.push({
          label: parts[slicedLength],
          url: slug,
          items: [],
          title,
        })
      }
      return accu
    },
    { items: [] },
  )

  const {
    sidebar: { forcedNavOrder = [] },
  } = config

  const tmp = [...forcedNavOrder]

  tmp.reverse()
  const orderedTree = tmp.reduce((accu, slug) => {
    const parts = slug.split("/")

    let { items: prevItems } = accu

    const slicedParts = parts.slice(1, -1)

    for (const part of slicedParts) {
      let tmp = prevItems.find((item) => item && item.label == part)

      if (tmp) {
        if (!tmp.items) {
          tmp.items = []
        }
      } else {
        tmp = { label: part, items: [] }
        prevItems.push(tmp)
      }
      if (tmp && tmp.items) {
        prevItems = tmp.items
      }
    }
    // sort items alphabetically.
    prevItems.map((item) => {
      item.items = item.items.sort(function (a, b) {
        if (a.label < b.label) return -1
        if (a.label > b.label) return 1
        return 0
      })
    })
    const slicedLength = Math.max(
      config.gatsby && config.gatsby.trailingSlash
        ? parts.length - 2
        : parts.length - 1,
      0,
    )

    const index = prevItems.findIndex(
      ({ label }) => label === parts[slicedLength],
    )

    if (prevItems.length) {
      accu.items.unshift(prevItems.splice(index, 1)[0])
    }

    return accu
  }, tree)

  return orderedTree
}

function computeCollapsedNav(location, items, collapsed) {
  if (!items) {
    return collapsed
  }
  return items.reduce((acc, item) => {
    const parts = item.url.split("/")
    if (item.url) {
      acc[item.url] =
        location?.pathname?.startsWith(item.url) ||
        config.sidebar.defaultExpanded.includes(item.url) ||
        parts.reduce((accu, part, index, list) => {
          return (
            acc &&
            location?.pathname?.startsWith(list.slice(0, index + 1)?.join("/"))
          )
        }, false)
    }

    return merge({}, acc, computeCollapsedNav(location, item.items, acc))
  }, collapsed)
}

const Tree = ({ edges }) => {
  let [treeData] = useState(() => {
    return calculateTreeData(edges)
  })

  let location
  if (typeof document != "undefined") {
    location = document.location
  }

  const expandedItems = useMemo(() => {
    return computeCollapsedNav(location, treeData.items, {})
  }, [treeData.items])
  const [expanded, setExpanded] = useState(expandedItems)
  const toggle = (url) => {
    setExpanded({
      ...expanded,
      [url]: !expanded[url],
    })
  }

  return (
    <TreeNode
      className={`${config.sidebar.frontLine ? "showFrontLine" : "hideFrontLine"} firstLevel`}
      toggleExpansion={toggle}
      expanded={expanded}
      {...treeData}
    />
  )
}

export default Tree
export { calculateTreeData }
