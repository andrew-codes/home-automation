type Validator = () => boolean
type Action = () => void

const doIf = (condition: Validator) => (action: Action) =>
  condition() ? action() : null

const not =
  (...conditions: Validator[]) =>
  (): boolean =>
    conditions.every((condition) => !condition())

export { doIf, not }
