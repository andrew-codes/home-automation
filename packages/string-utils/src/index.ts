import { camelCase, lowerCase, trim, upperFirst, words } from "lodash"

const formatKeys = (
  value: object | string | number | boolean | Array<any> | null
) => {
  if (value == null || value instanceof Date) {
    return value
  }
  if (Array.isArray(value)) {
    return value.map(formatKeys)
  }
  if (value instanceof Object) {
    return Object.entries(value).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [camelCase(key)]: formatKeys(value),
      }),
      {}
    )
  }
  return value
}

const nameFromId = (id) =>
  trim(words(lowerCase(id)).map(upperFirst).join(" "), " ")

export { formatKeys, nameFromId }
