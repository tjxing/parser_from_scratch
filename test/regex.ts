import { equal } from 'assert'
import { createRegex } from '../src/regex'

describe('Regex', function () {
  it('match regex /ab/', function () {
    const regex = createRegex('ab')
    equal('ab', regex?.match('ab'))
    equal(undefined, regex?.match('c'))
    equal('ab', regex?.match('abcd'))
  })

  it('match regex /ab*/', function () {
    const regex = createRegex('ab*')
    equal('abbbb', regex?.match('abbbb'))
    equal('a', regex?.match('a'))
    equal('abbbb', regex?.match('abbbbcd'))
    equal('a', regex?.match('acd'))
  })

  it('match regex /a(bc)*/', function () {
    const regex = createRegex('a(bc)*')
    equal('abcbcbc', regex?.match('abcbcbc'))
    equal('a', regex?.match('a'))
    equal('abcbcbc', regex?.match('abcbcbcd'))
    equal('a', regex?.match('ad'))
  })

  it('match regex /a(bc)+/', function () {
    const regex = createRegex('a(bc)+')
    equal('abcbcbc', regex?.match('abcbcbc'))
    equal(undefined, regex?.match('a'))
    equal('abcbcbc', regex?.match('abcbcbcd'))
  })

  it('svg debug', function () {
    createRegex('a(bc)+', true)
  })
})