import { ThemeProvider as EmotionThemeProvider, Global } from "@emotion/react"
import React, { useCallback, useEffect, useState } from "react"
import Header from "../Header.mjs"
import { baseStyles } from "../styles/GlobalStyles.mjs"
import { darkTheme, lightTheme } from "./index.mjs"

const ThemeProvider = ({ children, location }) => {
  const [isDarkThemeActive, setIsDarkThemeActive] = useState(false)

  useEffect(() => {
    retrieveActiveTheme()
  }, [])

  const retrieveActiveTheme = () => {
    let prefersDarkTheme = false
    const localStorageTheme = window.localStorage.getItem("isDarkThemeActive")
    if (localStorageTheme === null) {
      const prefersDarkTheme = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches
      window.localStorage.setItem(
        "isDarkThemeActive",
        JSON.stringify(prefersDarkTheme),
      )
    } else {
      prefersDarkTheme = JSON.parse(localStorageTheme)
    }
    setIsDarkThemeActive(prefersDarkTheme)
  }

  const toggleActiveTheme = useCallback(() => {
    setIsDarkThemeActive((prevIsDarkThemeActive) => {
      const newIsDarkThemeActive = !prevIsDarkThemeActive
      window.localStorage.setItem(
        "isDarkThemeActive",
        JSON.stringify(newIsDarkThemeActive),
      )
      return newIsDarkThemeActive
    })
  }, [])

  const currentActiveTheme = isDarkThemeActive ? darkTheme : lightTheme

  return (
    <div>
      <EmotionThemeProvider theme={currentActiveTheme}>
        <Global styles={[baseStyles]} />
        <Header
          location={location}
          isDarkThemeActive={isDarkThemeActive}
          toggleActiveTheme={toggleActiveTheme}
        />
        {children}
      </EmotionThemeProvider>
    </div>
  )
}

export default ThemeProvider
