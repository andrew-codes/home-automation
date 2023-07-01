const parseUtcToLocalDate = (s: string, timeZone: string): Date => {
  const utcDate = new Date(`${s}${s.endsWith("00:00:00.0000000") ? "" : "Z"}`)

  const zone = getZone(timeZone)
  const timeZoneOffset = getOffset(zone)

  const localTimestamp =
    utcDate.getTime() - Math.abs(timeZoneOffset) * 60 * 1000

  return new Date(localTimestamp)
}

const getZone = (timeZone: string): string => {
  if (timeZone.startsWith("Eastern")) {
    return "America/New_York"
  }

  return "UTC"
}

const getOffset = (timeZone = "UTC", date = new Date()): number => {
  const utcDate = new Date(date.toLocaleString("en-US", { timeZone: "UTC" }))
  const tzDate = new Date(date.toLocaleString("en-US", { timeZone }))

  return (tzDate.getTime() - utcDate.getTime()) / 6e4
}

export default parseUtcToLocalDate
