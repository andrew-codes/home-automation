import { graphql } from "gatsby"
import React from "react"
import Helmet from "react-helmet"
import config from "../../config.mjs"
import githubIcon from "../components/images/github.svg"
import Layout from "../components/Layout.mjs"
import Link from "../components/Link.mjs"
import NextPrevious from "../components/NextPrevious.mjs"
import {
  Edit,
  StyledHeading,
  StyledMainWrapper,
} from "../components/styles/Docs.mjs"

const forcedNavOrder = config.sidebar.forcedNavOrder

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

  const navItems = allMdx.edges
    .filter(({ node }) => !node.fields.draft)
    .map(({ node }) => node.fields.slug)
    .sort()
    .reduce(
      (acc, cur) => {
        if (forcedNavOrder.find((url) => url === cur)) {
          return { ...acc, [cur]: [cur] }
        }

        let prefix = cur.split("/")[1]

        if (config.gatsby?.trailingSlash) {
          prefix = prefix + "/"
        }

        if (prefix && forcedNavOrder.find((url) => url === `/${prefix}`)) {
          return { ...acc, [`/${prefix}`]: [...acc[`/${prefix}`], cur] }
        } else {
          return { ...acc, items: [...acc.items, cur] }
        }
      },
      { items: [] },
    )

  const nav = forcedNavOrder
    .reduce((acc, cur) => {
      return acc.concat(navItems[cur])
    }, [])
    .concat(navItems.items)
    .map((slug) => {
      if (slug) {
        const { node } = allMdx.edges.find(
          ({ node }) => node.fields.slug === slug,
        )
        if (!node.fields.draft) {
          return { title: node.fields.title, url: node.fields.slug }
        }
      }

      return null
    })
    .filter(Boolean)

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
    "Documentation on engineering and development of my home automation."

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
    allMdx {
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
