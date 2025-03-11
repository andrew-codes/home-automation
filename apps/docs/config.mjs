const config = {
  gatsby: {
    pathPrefix: "/",
    siteUrl: "https://docs.smith-simms.family",
    gaTrackingId: null,
    trailingSlash: true,
  },
  header: {
    logo: "",
    logoLink: "",
    title: "Home Automation - Andrew Smith",
    githubUrl: "https://github.com/andrew-codes/home-automation",
    helpUrl: "",
    tweetText: "",
    social: ``,
    links: [{ text: "", link: "" }],
    search: {
      enabled: true,
      indexName: "",
      algoliaAppId: process.env.GATSBY_ALGOLIA_APP_ID,
      algoliaSearchKey: process.env.GATSBY_ALGOLIA_SEARCH_KEY,
      algoliaAdminKey: process.env.ALGOLIA_ADMIN_KEY,
    },
  },
  sidebar: {
    forcedNavOrder: ["/", "getting-started", "apps"],
    defaultExpanded: ["/getting-started/"],
    links: [],
    frontLine: false,
    ignoreIndex: false,
    title: "",
  },
  siteMetadata: {
    title: "Technical Documentation | Andrew Smith's Home Automation",
    description: "",
    ogImage: null,
    docsLocation:
      "https://github.com/andrew-codes/home-automation/tree/master/apps/docs/src/content",
    favicon: "",
  },
}

export default config
