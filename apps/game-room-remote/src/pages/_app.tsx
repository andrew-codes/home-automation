import React from "react"
import PropTypes from "prop-types"
import Head from "next/head"

export default function MyApp(props) {
  const { Component, pageProps } = props

  return (
    <React.Fragment>
      <Head>
        <title>Game Room Remote</title>
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width"
        />
      </Head>
      <Component {...pageProps} />
    </React.Fragment>
  )
}

MyApp.propTypes = {
  Component: PropTypes.elementType.isRequired,
  pageProps: PropTypes.object.isRequired,
}
