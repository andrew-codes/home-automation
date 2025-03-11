// import "gatsby-plugin-mdx/component-with-mdx-scope"
import fs from "fs/promises"
import { startCase } from "lodash-es"
import path from "path"
import config from "./config.mjs"

const createPages = async ({ graphql, actions }) => {
  const result = await graphql(`
    {
      allMdx {
        edges {
          node {
            id
            tableOfContents
            fields {
              slug
              draft
            }
            internal {
              contentFilePath
            }
          }
        }
      }
    }
  `)

  if (result.errors) {
    console.error(result.errors)
    throw new Error("There was an error loading the MDX files.")
  }

  const mdxTemplate = path.resolve(`./src/templates/mdx.js`)
  const { createPage } = actions
  return result.data?.allMdx?.edges
    ?.filter(({ node }) => !node.fields.draft)
    ?.map(({ node }) => {
      let slug = node.fields.slug
      if (!slug || slug.startsWith("/index")) {
        slug = "/"
      }
      createPage({
        path: slug,
        component: `${mdxTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
        context: {
          id: node.id,
        },
      })
    })
}

const onCreateNode = async ({ node, getNode, actions }) => {
  if (node.internal.type === `Mdx`) {
    if (!node.parent) {
      console.warn(
        `onCreateNode: No parent: ${node.internal.type} ${node.internal.contentFilePath} has no parent`,
      )
      return
    }

    const parent = getNode(node.parent)
    if (!parent) {
      console.warn(
        `onCreateNode: ${node.internal.type} ${node.internal.contentFilePath} has no parent`,
      )
      return
    }

    // console.debug("node", node)
    // console.debug("parent", parent)

    const appPathName = /.*\/apps\/([a-zA-Z0-9-]+)\/.*/.exec(parent.dir)?.[1]
    let appName = null
    if (appPathName) {
      try {
        const appProjectJson = await fs.readFile(
          path.join("../", appPathName, "project.json"),
          "utf8",
        )
        const appProject = JSON.parse(appProjectJson)
        appName = appProject.name ?? null
      } catch (e) {
        appName = null
        console.error(
          `Failed to read project.json for app ${appPathName}: ${e?.toString()}`,
        )
      }
    }
    const { createNodeField } = actions
    createNodeField({
      name: "appName",
      node,
      value: appName || null,
    })

    let value = parent.relativePath.replace(parent.ext, "")
    if (appName === "docs") {
      if (value === "index") {
        value = "/"
      } else {
        value = `/${value}`
      }
    }
    if (appName !== "docs") {
      if (value === "index") {
        value = `/apps/${appName}`
      } else {
        value = `/apps/${appName}/${value}`
      }
    }
    if (config.gatsby?.trailingSlash && !value.endsWith("/")) {
      value = `${value}/`
    }
    createNodeField({
      name: `slug`,
      node,
      value,
    })

    createNodeField({
      name: "id",
      node,
      value: node.id,
    })
    createNodeField({
      name: "draft",
      node,
      value: !!node.frontmatter?.draft,
    })
    createNodeField({
      name: "title",
      node,
      value: node.frontmatter.title || startCase(parent.name),
    })
    createNodeField({
      name: "description",
      node,
      value: node.frontmatter.description || "",
    })
  }
}

export { createPages, onCreateNode }
