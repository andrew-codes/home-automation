const authorize = (apiToken: string) => (request) => {
  if (!request.headers || !request.headers.authorization) {
    throw new Error("Unauthorized")
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
    throw new Error("Unauthorized")
  }
}
const authorizeMiddleware = (apiToken: string) => {
  const authorizeApi = authorize(apiToken)
  return (request, response, next) => {
    try {
      authorizeApi(request)
      return next()
    } catch (error) {
      return next(error)
    }
  }
}

export { authorize, authorizeMiddleware }
