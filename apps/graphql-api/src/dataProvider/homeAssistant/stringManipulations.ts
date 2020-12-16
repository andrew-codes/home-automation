import { camelCase, lowerCase, trim, upperFirst, words } from "lodash"

const toCamelCaseProperties = (
  obj: object | string | number | boolean | Array<any> | null
) => {
  if (obj == null) {
    return undefined
  }
  if (Array.isArray(obj)) {
    return obj.map(toCamelCaseProperties)
  }
  if (obj instanceof Object) {
    return Object.entries(obj).reduce(
      (acc, [key, value]) => ({
        ...acc,
        [camelCase(key)]: toCamelCaseProperties(value),
      }),
      {}
    )
  }
  return obj
}

const nameFromId = (id) =>
  trim(words(lowerCase(id)).map(upperFirst).join(" "), " ")

export { toCamelCaseProperties, nameFromId }
