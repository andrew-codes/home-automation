interface ConfigurationApi<Configuration> {
  get(name: keyof Configuration): Promise<keyof Configuration>
}

export type { ConfigurationApi }
