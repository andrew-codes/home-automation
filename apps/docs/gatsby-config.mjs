import path from "path"
import remarkGfm from "remark-gfm"
import config from "./config.mjs"

const plugins = [
  "gatsby-plugin-typescript",
  "gatsby-plugin-emotion",
  "gatsby-plugin-image",
  "gatsby-plugin-sitemap",
  "gatsby-plugin-sharp",
  "gatsby-transformer-sharp",
  "gatsby-plugin-react-helmet",
  {
    resolve: "gatsby-plugin-mdx",
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
      extensions: [".mdx", ".md"],
    },
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "docs",
      path: path.resolve("./src/content/"),
    },
    __key: "docs",
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "backups",
      path: path.resolve("../backups/docs"),
    },
    __key: "backups",
  },
  {
    resolve: "gatsby-source-filesystem",
    options: {
      name: "captive-portal",
      path: path.resolve("../captive-portal/docs"),
    },
    __key: "captive-portal",
  },
  // {
  //   resolve: "gatsby-source-filesystem",
  //   options: {
  //     name: "apps",
  //     path: path.join(__dirname, ".."),
  //   },
  //   __key: "apps",
  // },
]

// check and add algolia
// if (
//   config.header.search &&
//   config.header.search.enabled &&
//   config.header.search.algoliaAppId &&
//   config.header.search.algoliaAdminKey
// ) {
//   plugins.push({
//     resolve: `gatsby-plugin-algolia`,
//     options: {
//       appId: config.header.search.algoliaAppId, // algolia application id
//       apiKey: config.header.search.algoliaAdminKey, // algolia admin key to index
//       queries,
//       chunkSize: 10000, // default: 1000
//     },
//   })
// }
// check and add pwa functionality
// if (config.pwa && config.pwa.enabled && config.pwa.manifest) {
//   plugins.push({
//     resolve: `gatsby-plugin-manifest`,
//     options: { ...config.pwa.manifest },
//   })
//   plugins.push({
//     resolve: "gatsby-plugin-offline",
//     options: {
//       appendScript: require.resolve(`./src/custom-sw-code.js`),
//     },
//   })
// } else {
//   plugins.push("gatsby-plugin-remove-serviceworker")
// }

// check and remove trailing slash
// if (config.gatsby && !config.gatsby.trailingSlash) {
//   plugins.push("gatsby-plugin-remove-trailing-slashes")
// }

const gatsbyConfig = {
  pathPrefix: config.gatsby.pathPrefix,
  siteMetadata: {
    title: config.siteMetadata.title,
    description: config.siteMetadata.description,
    docsLocation: config.siteMetadata.docsLocation,
    ogImage: config.siteMetadata.ogImage,
    favicon: config.siteMetadata.favicon,
    logo: {
      link: config.header.logoLink ? config.header.logoLink : "/",
      image: config.header.logo,
    }, // backwards compatible
    headerTitle: config.header.title,
    githubUrl: config.header.githubUrl,
    helpUrl: config.header.helpUrl,
    tweetText: config.header.tweetText,
    headerLinks: config.header.links,
    siteUrl: config.gatsby.siteUrl,
  },
  plugins,
  flags: {
    DEV_SSR: true,
    FAST_DEV: true, // Enable all experiments aimed at improving develop server start time
    PRESERVE_WEBPACK_CACHE: false, // (Umbrella Issue (https://gatsby.dev/cache-clearing-feedback)) · Use webpack's persistent caching and don't delete webpack's cache when changing gatsby-node.js & gatsby-config.js files.
    PRESERVE_FILE_DOWNLOAD_CACHE: false, // (Umbrella Issue (https://gatsby.dev/cache-clearing-feedback)) · Don't delete the downloaded files cache when changing gatsby-node.js & gatsby-config.js files.
    PARALLEL_SOURCING: false, // EXPERIMENTAL · (Umbrella Issue (https://gatsby.dev/parallel-sourcing-feedback)) · Run all source plugins at the same time instead of serially. For sites with multiple source plugins, this can speedup sourcing and transforming considerably.
    FUNCTIONS: false, // EXPERIMENTAL · (Umbrella Issue (https://gatsby.dev/functions-feedback)) · Compile Serverless functions in your Gatsby project and write them to disk, ready to deploy to Gatsby Cloud
  },
}

export default gatsbyConfig
