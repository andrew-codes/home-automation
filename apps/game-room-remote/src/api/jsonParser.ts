const dateFormat = /[1-2]\d{3}-[0-1][0-9]-[0-3][0-9]T/
const jsonReviver = (key: string, value: any) => {
  if (typeof value !== "string") {
    return value
  }

  if (!dateFormat.test(value)) {
    return value
  }

  const parsedDate = Date.parse(value)
  if (Number.isNaN(parsedDate)) {
    return value
  }
  return new Date(parsedDate)
}

const parse = (payload: string) => JSON.parse(payload, jsonReviver)

export default parse
