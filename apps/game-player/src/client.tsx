import * as React from 'react'
import { render } from "react-dom"
import { App } from "./client/App"

const appEl = document.getElementById("app")
render(<App />, appEl)
