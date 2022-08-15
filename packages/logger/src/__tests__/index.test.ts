import * as sut from '../'
import createLogger from '../createLogger'

describe('logger', () => {
    test.skip('exports create logger', () => {
        expect(sut.createLogger).toEqual(createLogger)
    });
})