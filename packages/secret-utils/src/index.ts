const toEnvName = (secretName: string): string =>
  secretName.replace(/(\/|-)/g, "_").toUpperCase()

export { toEnvName }
