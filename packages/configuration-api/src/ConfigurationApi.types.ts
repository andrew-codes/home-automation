interface ConfigurationApi<Configuration> {
  get(name: keyof Configuration): Promise<string>
}

export type { ConfigurationApi }
