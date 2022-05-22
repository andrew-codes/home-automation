import _isNode from "detect-node"
import { doIf, not } from "./utils"

const isNode = () => _isNode
const isBrowser = not(isNode)

const isProd = (): boolean => process.env.NODE_ENV === "production"
const isTest = (): boolean => process.env.NODE_ENV === "test"
const isDev = (): boolean => process.env.NODE_ENV === "development"

const devOnly = doIf(isDev)
const prodOnly = doIf(isProd)
const excludeProd = doIf(not(isProd))
const excludeDev = doIf(not(isDev))

export {
  isNode,
  isBrowser,
  isProd,
  isTest,
  isDev,
  devOnly,
  prodOnly,
  excludeProd,
  excludeDev,
}
