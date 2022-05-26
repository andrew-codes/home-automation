import * as sut from '..'
import * as env from '../env'
import * as utils from '../utils'

test('exports env', () => {
  expect(sut).toMatchObject(env)
})

test('exports utils', () => {
  expect(sut).toMatchObject(utils)
})
