import React, { useEffect } from "react"
import { Provider } from "react-redux";
import store from "../app/store";

const MyApp = (props) => {
  const { Component, pageProps } = props

  useEffect(() => {
    store.dispatch({
      type: "SOCKET/CONNECT", payload: {
        socketUrl: "/api/socket",
        eventHandlers: {
          onError: (args) => {
            return { type: "SOCKET/ERROR", payload: args }
          },
          onMessage: (payload) => {
            return { type: "SOCKET/MESSAGE", payload }
          },
          onClose: () => {
            return { type: "SOCKET/MESSAGE", payload: "closed" }
          },
          onOpen: () => {
            return { type: "SOCKET/MESSAGE", payload: "opened" }
          },
        }
      }
    })
  }, [])

  return (
    <Provider store={store}><Component {...pageProps} /></Provider>
  )
}

export default MyApp