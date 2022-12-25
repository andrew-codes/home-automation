type GenericFunction = (...args: unknown[]) => unknown | Promise<unknown>
type MockedFunc<T extends GenericFunction> = () =>
  | Partial<ReturnType<T>>
  | Promise<Partial<Awaited<ReturnType<T>>>>

const partialMocked = <T extends MockedFunc<T>>(source: T) =>
  jest.mocked<MockedFunc<T>>(source)

export { partialMocked }
