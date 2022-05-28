interface ConfigurationApi<Configuration> {
  get<Name extends keyof Configuration>(
    name: Name,
  ): Promise<Configuration[Name]>
}

export type { ConfigurationApi }
