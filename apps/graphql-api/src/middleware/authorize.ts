const authorize = (apiToken: string) => (request, response, next) => {
  if (!request.headers || !request.headers.authorization) {
    return next(new Error("Unauthorized"))
  }
  let token
  const parts = request.headers.authorization.split(" ")
  if (parts.length == 2) {
    const scheme = parts[0]
    const credentials = parts[1]

    if (/^Bearer$/i.test(scheme)) {
      token = credentials
    }
  }
  if (!token || token !== apiToken) {
    return next(new Error("Unauthorized"))
  }
  return next()
}

export { authorize }
