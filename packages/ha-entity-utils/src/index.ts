import { lowerCase, snakeCase, startCase } from "lodash"
import { flow } from "lodash/fp"

const toEntityId = flow([snakeCase])

const toFriendlyName = flow([lowerCase, startCase])

export { toEntityId, toFriendlyName }
