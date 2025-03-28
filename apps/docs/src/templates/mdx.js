import { graphql } from "gatsby"
import { isEmpty } from "lodash-es"
import React from "react"
import Helmet from "react-helmet"
import config from "../../config.mjs"
import githubIcon from "../components/images/github.svg"
import Layout from "../components/Layout.mjs"
import Link from "../components/Link.mjs"
import NextPrevious from "../components/NextPrevious.mjs"
import { calculateTreeData } from "../components/sidebar/tree.mjs"
import {
  Edit,
  StyledHeading,
  StyledMainWrapper,
} from "../components/styles/Docs.mjs"

const forcedNavOrder = config.sidebar.forcedNavOrder

const flattenTree = (acc, node) => {
  if (!node) {
    return acc
  }
  if (node.title && node.url) {
    acc.push({
      title: node.title,
      url: node.url,
    })
  }

  if (!isEmpty(node.items)) {
    node.items.forEach((child) => {
      if (!child) {
        return
      }
      acc = flattenTree(acc, child)
    })
  }

  return acc
}

const MDXRuntimeTest = ({ data, children, ...rest }) => {
  if (!data) {
    console.warn(
      "MDXRuntimeTest: No data passed to MDXRuntimeTest. This is likely due to a missing GraphQL query.",
    )
    return (
      <>
        <Helmet>
          <Head data={data} {...rest} />
        </Helmet>
        {children}
      </>
    )
  }

  const {
    allMdx,
    mdx,
    site: {
      siteMetadata: { docsLocation },
    },
  } = data

  const nav = flattenTree(
    [],
    calculateTreeData(
      allMdx.edges
        .filter(({ node }) => !node.fields.draft)
        .filter(({ node }) => !node.fields.slug.startsWith("/adr")),
    ),
  )

  return (
    <>
      <Helmet>
        <Head data={data} {...rest} />
      </Helmet>
      <Layout {...rest}>
        <div className={"titleWrapper"}>
          <StyledHeading>{mdx.fields.title}</StyledHeading>
          <Edit className={"mobileView"}>
            {docsLocation && (
              <Link
                className={"gitBtn"}
                to={`${docsLocation}/${mdx.parent.relativePath}`}
              >
                <img src={githubIcon} alt={"Github logo"} /> Edit on GitHub
              </Link>
            )}
          </Edit>
        </div>
        <StyledMainWrapper>{children}</StyledMainWrapper>
        <div className={"addPaddTopBottom"}>
          <NextPrevious mdx={mdx} nav={nav} />
        </div>
      </Layout>
    </>
  )
}

const Head = ({ data }) => {
  const mdx = data?.mdx

  const metaTitle = `${mdx?.fields?.title ?? "Docs"} | ${
    config.siteMetadata.title
  }`

  const metaDescription =
    mdx?.fields?.description ??
    "Documentation on engineering and development of my home lab."

  return (
    <>
      <title>{metaTitle}</title>
      <meta name="title" content={metaTitle} />
      <meta name="description" content={metaDescription} />
      <meta property="og:title" content={metaTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="twitter:title" content={metaTitle} />
      <meta property="twitter:description" content={metaDescription} />
    </>
  )
}

const pageQuery = graphql`
  query ($id: String!) {
    site {
      siteMetadata {
        title
        docsLocation
      }
    }
    mdx(id: { eq: $id }) {
      fields {
        title
        slug
      }
      id
      body
      tableOfContents
      parent {
        ... on File {
          relativePath
        }
      }
      fields {
        title
        description
      }
    }
    allMdx(sort: { fields: { slug: ASC } }) {
      edges {
        node {
          fields {
            draft
            slug
            title
          }
        }
      }
    }
  }
`

export default MDXRuntimeTest
export { pageQuery }
