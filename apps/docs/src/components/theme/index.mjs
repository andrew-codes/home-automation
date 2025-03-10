import { themes } from "prism-react-renderer"

const baseTheme = {
  fonts: {
    mono: '"SF Mono", "Roboto Mono", Menlo, monospace',
  },
}

const lightTheme = {
  ...baseTheme,
  name: "light",
  colors: {
    background: "#fff",
    heading: "#000",
    text: "#3B454E",
    preFormattedText: "rgb(245, 247, 249)",
    link: "#1000EE",
  },
  code: themes.github,
  table: {
    secondaryBackground: "#f8f8f8",
  },
}

const darkTheme = {
  ...baseTheme,
  name: "dark",
  colors: {
    background: "#001933",
    heading: "#fff",
    text: "#fff",
    preFormattedText: "#000",
    link: "#1ED3C6",
  },
  code: themes.dracula,
  table: {
    secondaryBackground: "#00142a",
  },
}

export { darkTheme, lightTheme }
