import { useTheme } from "@emotion/react"
import { Highlight, Prism } from "prism-react-renderer"
import React, { useEffect, useReducer } from "react"
import Loadable from "react-loadable"
import { applyLanguages } from "../../custom/config/codeBlockLanguages.mjs"
import LoadingProvider from "./loading.mjs"

/** Removes the last token from a code example if it's empty. */
function cleanTokens(tokens) {
  const tokensLength = tokens.length

  if (tokensLength === 0) {
    return tokens
  }
  const lastToken = tokens[tokensLength - 1]

  if (lastToken.length === 1 && lastToken[0].empty) {
    return tokens.slice(0, tokensLength - 1)
  }
  return tokens
}

const LoadableComponent = Loadable({
  loader: () => import("./LiveProvider.mjs"),
  loading: LoadingProvider,
})

/* eslint-disable react/jsx-key */
const CodeBlock = ({ children: exampleCode, ...props }) => {
  const [, forceUpdate] = useReducer((x) => x + 1, 0)
  useEffect(() => {
    var windowPrism = window.Prism
    window.Prism = Prism
    applyLanguages(Prism).then(() => {
      window.Prism = windowPrism

      forceUpdate()
    })
  }, [])

  const theme = useTheme()

  if (props["react-live"]) {
    return <LoadableComponent code={exampleCode} />
  } else {
    const lang = /language-([a-zA-Z0-9-]+) ?/.exec(props.className)
    const language = lang ? lang[1] : "javascript"
    return (
      <Highlight code={exampleCode} language={language} theme={theme?.code}>
        {({ className, style, tokens, getLineProps, getTokenProps }) => {
          return (
            <pre
              className={className}
              style={{
                ...style,
                padding: "1rem",
                borderRadius: "4px",
                border: "1px solid #c6bfcd",
              }}
              p={3}
            >
              {cleanTokens(tokens).map((line, i) => {
                let lineClass = {}

                let isDiff = false

                if (
                  line[0] &&
                  line[0].content.length &&
                  line[0].content[0] === "+"
                ) {
                  lineClass = { backgroundColor: "rgba(76, 175, 80, 0.2)" }
                  isDiff = true
                } else if (
                  line[0] &&
                  line[0].content.length &&
                  line[0].content[0] === "-"
                ) {
                  lineClass = { backgroundColor: "rgba(244, 67, 54, 0.2)" }
                  isDiff = true
                } else if (
                  line[0] &&
                  line[0].content === "" &&
                  line[1] &&
                  line[1].content === "+"
                ) {
                  lineClass = { backgroundColor: "rgba(76, 175, 80, 0.2)" }
                  isDiff = true
                } else if (
                  line[0] &&
                  line[0].content === "" &&
                  line[1] &&
                  line[1].content === "-"
                ) {
                  lineClass = { backgroundColor: "rgba(244, 67, 54, 0.2)" }
                  isDiff = true
                }
                const lineProps = getLineProps({ line, key: i })

                lineProps.style = lineClass
                const diffStyle = {
                  userSelect: "none",
                  MozUserSelect: "-moz-none",
                  WebkitUserSelect: "none",
                }

                let splitToken

                return (
                  <div {...lineProps} key={line + i}>
                    {line.map((token, key) => {
                      if (isDiff) {
                        if (
                          (key === 0 || key === 1) &&
                          (token.content.charAt(0) === "+" ||
                            token.content.charAt(0) === "-")
                        ) {
                          if (token.content.length > 1) {
                            splitToken = {
                              types: ["template-string", "string"],
                              content: token.content.slice(1),
                            }
                            const firstChar = {
                              types: ["operator"],
                              content: token.content.charAt(0),
                            }

                            return (
                              <React.Fragment key={token + key}>
                                <span
                                  {...getTokenProps({ token: firstChar, key })}
                                  style={diffStyle}
                                />
                                <span
                                  {...getTokenProps({ token: splitToken, key })}
                                />
                              </React.Fragment>
                            )
                          } else {
                            return (
                              <span
                                {...getTokenProps({ token, key })}
                                style={diffStyle}
                              />
                            )
                          }
                        }
                      }
                      return <span {...getTokenProps({ token, key })} />
                    })}
                  </div>
                )
              })}
            </pre>
          )
        }}
      </Highlight>
    )
  }
}

export default CodeBlock
