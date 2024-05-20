const toEnvName = (secretName: string): string =>
  secretName.replace(/(\/|-)/g, "_").toUpperCase()

const toK8sName = (secretName: string): string => secretName.replace(/\//g, "-")

export { toEnvName, toK8sName }
