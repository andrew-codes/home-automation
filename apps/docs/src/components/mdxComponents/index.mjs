import styled from "@emotion/styled"
import * as React from "react"
import AnchorTag from "./anchor.mjs"
import CodeBlock from "./codeBlock.mjs"
import { InlineCode } from "./InlineCode.mjs"

const Table = styled("table")`
  border-collapse: collapse;
  width: 100%;

  thead tr {
    border-bottom: 1px solid #c6bfcd;
    background-color: ${(props) => props.theme.table.secondaryBackground};
  }

  tr {
    border-top: 1px solid #c6bfcd;
    margin: 0;
    padding: 0;
  }

  tr:nth-child(2n) {
    background-color: ${(props) => props.theme.table.secondaryBackground};
  }

  tr th {
    font-weight: bold;
    text-align: left;
    margin: 0;
    padding: 1rem;
  }

  tr td {
    text-align: left;
    margin: 0;
    padding: 6px 13px;
  }

  tr th :first-child,
  tr td :first-child {
    margin-top: 0;
  }

  tr th :last-child,
  tr td :last-child {
    margin-bottom: 0;
  }
`

const appendString = (children) => {
  if (Array.isArray(children)) {
    return children.reduce((acc, current) => {
      if (typeof current === "string") {
        return acc.concat(current)
      } else if (typeof current === "object") {
        return acc.concat(current.props.children)
      } else {
        return acc
      }
    }, "")
  } else {
    return children
  }
}

export default {
  h1: (props) => (
    <h1
      className="heading1"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  h2: (props) => (
    <h2
      className="heading2"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  h3: (props) => (
    <h3
      className="heading3"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  h4: (props) => (
    <h4
      className="heading4"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  h5: (props) => (
    <h5
      className="heading5"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  h6: (props) => (
    <h6
      className="heading6"
      id={appendString(props.children).replace(/\s+/g, "").toLowerCase()}
      {...props}
    />
  ),
  p: (props) => <p className="paragraph" {...props} />,
  pre: (props) => {
    return <CodeBlock {...props.children.props} />
  },
  code: (props) => {
    return <InlineCode {...props} />
  },
  a: AnchorTag,
  table: (props) => <Table {...props}></Table>,
  // TODO add `img`
  // TODO add `blockquote`
  // TODO add `ul`
  // TODO add `li`
  // TODO add `table`
}
