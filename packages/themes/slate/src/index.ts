import ThemeFunction, { Colors } from "@ha/themes-definition"

const transparent = "rgba(0,0,0,0)"

const light: Colors = {
  main: "#c9d1d9",
  accent: "#21262d",
  muted: "#8b949e",
  subtle: "rgba(240,246,252,0.1)",
}

const dark: Colors = {
  main: "#0d1117",
  accent: "#161b22",
  muted: transparent,
  subtle: transparent,
}

const themeFunction: ThemeFunction = (accent, backdrop, highlights) => ({
  background: {
    neutral: backdrop.main,
    sideBar: backdrop.accent,
  },
  text: {
    color: accent.main,
    mutedColor: accent.muted,
  },
  textfield: {
    color: accent.main,
    hintColor: accent.muted,
    background: transparent,
    backgroundHover: accent.subtle,
    borderColor: accent.subtle,
  },
})

export default themeFunction
export { light, dark }
