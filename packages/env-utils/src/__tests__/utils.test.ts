import { doIf, not } from '../utils'

describe('not', () => {
  let falsey
  let truthy

  beforeEach(() => {
    falsey = () => false
    truthy = () => true
  })

  test('returns false if any condition is true', () => {
    const condition = not(falsey, truthy)
    expect(condition()).toEqual(false)
  })

  test('returns true if every condition is false', () => {
    const condition = not(falsey, falsey)
    expect(condition()).toEqual(true)
  })
})

describe('doIf', () => {
  let falsey
  let truthy

  beforeEach(() => {
    falsey = () => false
    truthy = () => true
  })

  test('does not invoke action when condition is false', () => {
    const action = jest.fn()
    doIf(falsey)
    expect(action).not.toBeCalled()
  })

  test('invokes action when condition is true', () => {
    const action = jest.fn()
    doIf(truthy)
    expect(action).not.toBeCalled()
  })
})
