const getNow = () => {
  const nowUtc = new Date()
  return new Date(nowUtc.getTime() - nowUtc.getTimezoneOffset() * 60000)
}

export default getNow
