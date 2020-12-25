const closeMongo = (client) => {
  return async (request, response, next) => {
    await client.close()
    return next()
  }
}

export { closeMongo }
