interface ConfigurationApi<Configuration> {
  getNames(): Array<keyof Configuration>
  get<Name extends keyof Configuration>(
    name: Name,
  ): Promise<Configuration[Name]>
  set<Name extends keyof Configuration>(
    name: Name,
    value: string,
  ): Promise<void>
}

export type { ConfigurationApi }
