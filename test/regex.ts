import { equal } from 'assert'
import { createRegex } from '../src/regex'

describe('Regex', function () {

  describe('test 1', function () {
    it('match regex /ab/', function () {
      const regex = createRegex('ab*')
      equal('ab', regex?.match('ab'))
    })
  })

})