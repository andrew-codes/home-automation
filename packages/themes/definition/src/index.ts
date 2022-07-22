type Colors = {
  main: string
  accent: string
  muted: string
  subtle: string
}

type Theme = {
  background: {
    neutral: string
    sideBar: string
  }
  text: {
    color: string
    mutedColor: string
  }
  textfield: {
    background: string
    backgroundHover: string
    borderColor: string
    color: string
  }
}

interface ThemeFunction {
  (accent: Colors, backdrop: Colors, highlights?: Colors): Theme
}

export default ThemeFunction
export type { Colors, Theme }
