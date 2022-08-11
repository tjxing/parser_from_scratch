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

  it('escape test 1', function () {
    const regex = createRegex('\\b\\f\\n\\r\\t\\v')
    equal('\b\f\n\r\t\v', regex?.match('\b\f\n\r\t\v'))
    equal('\b\f\n\r\t\v', regex?.match('\b\f\n\r\t\vabc'))
  })

  it('escape test 2', function () {
    const regex = createRegex('a(\\b\\f)+\\n\\r*\\t\\v')
    equal('a\b\f\b\f\b\f\n\t\v', regex?.match('a\b\f\b\f\b\f\n\t\v'))
  })

  it('escape test 3', function () {
    const regex = createRegex('\\a\\\\\\(')
    equal('a\\(', regex?.match('a\\(xyz'))
  })

  it('escape negative', function () {
    equal(undefined, createRegex('abc\\'))
  })

  it('unicode test', function () {
    const regex = createRegex('a\\u4F60\\u597dz')
    equal('a\u4f60\u597dz', regex?.match('a\u4f60\u597dzz'))
  })

  it('unicode negative', function () {
    const regex = createRegex('\\ua7zm')
    equal('ua7zm', regex?.match('ua7zmxyz'))
  })

  it('svg debug', function () {
    createRegex('a(bc)+', true)
  })
})