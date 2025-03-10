// import "gatsby-plugin-mdx/component-with-mdx-scope"
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
  console.log(mdxTemplate)
  const { createPage } = actions
  return result.data?.allMdx?.edges?.map(({ node }) => {
    createPage({
      path: node.fields.slug ? node.fields.slug : "/",
      component: `${mdxTemplate}?__contentFilePath=${node.internal.contentFilePath}`,
      context: {
        id: node.id,
      },
    })
  })
}

const onCreateWebpackConfig = ({ actions }) => {
  // actions.setWebpackConfig({
  //   module: {
  //     rules: [
  //       {
  //         test: /\.svg$/,
  //         use: ["@svgr/webpack"],
  //       },
  //     ],
  //   },
  // })
}

const onCreateNode = ({ node, getNode, actions }) => {
  if (node.internal.type === `Mdx`) {
    if (!node.parent) {
      console.debug(
        `onCreateNode: No parent: ${node.internal.type} ${node.internal.contentFilePath} has no parent`,
      )
      return
    }

    const parent = getNode(node.parent)
    if (!parent) {
      console.debug(
        `onCreateNode: ${node.internal.type} ${node.internal.contentFilePath} has no parent`,
      )
      return
    }

    let value = parent.relativePath.replace(parent.ext, "")

    if (value === "index") {
      value = ""
    }

    const { createNodeField } = actions
    if (config.gatsby && config.gatsby.trailingSlash) {
      createNodeField({
        name: `slug`,
        node,
        value: value === "" ? `/` : `/${value}/`,
      })
    } else {
      createNodeField({
        name: `slug`,
        node,
        value: `/${value}`,
      })
    }

    createNodeField({
      name: "id",
      node,
      value: node.id,
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

export { createPages, onCreateNode, onCreateWebpackConfig }
