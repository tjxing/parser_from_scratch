import { NFA, Path } from "../nfa";
import generator from './state_gen'
import Str from "./str";

export type Parser = (s: Str) => [nfa: NFA[], s: Str] | undefined

export function createSimpleNFA(c: number): NFA {
    const start = generator.newState()
    start.setTerminal(false)
    const terminal = generator.newState()
    const path = new Path(c, terminal)
    start.addPath(path)
    return new NFA(start, [terminal])
}

export function charParser(c: string): Parser {
    return charCodeParser(c.charCodeAt(0))
}

export function charCodeParser(c: number): Parser {
    return (s: Str) => {
        const next = s.nextCharCode()
        if (next && next[0] == c) {
            return [[createSimpleNFA(c)], next[1]]
        }
        return undefined
    }
}

export function not(...c: string[]): Parser {
    return (s: Str) => {
        const next = s.nextChar()
        if (next && c.find(char => char == next[0]) == undefined) {
            return [[createSimpleNFA(next[0].charCodeAt(0))], next[1]]
        }
        return undefined
    }
}

export function rangeParser(a: number, b: number): Parser {
    return (s: Str) => {
        const next = s.nextCharCode()
        if (next && next[0] >= a && next[0] <= b) {
            const start = generator.newState()
            start.setTerminal(false)
            const terminal = generator.newState()
            for (let x = a; x <= b; ++x) {
                const path = new Path(x, terminal)
                start.addPath(path)
            }
            return [[new NFA(start, [terminal])], next[1]]
        }
        return undefined
    }
}

export function connect(a: Parser, ...b: Parser[]): Parser {
    return (s: Str) => {
        let result = a(s)
        if (result) {
            for (let i in b) {
                const r = b[i](result[1])
                if (r) {
                    r[0].forEach(n => result[0].push(n))
                    result = [result[0], r[1]]
                } else {
                    return undefined
                }
            }
        }
        return result
    }
}

export function or(a: Parser, ...b: Parser[]): Parser {
    return (s: Str) => {
        const result = a(s)
        if (result == undefined) {
            for (let i in b) {
                const r = b[i](s)
                if (r) {
                    return r
                }
            }
            return undefined
        }
        return result
    }
}

export function repeat(a: Parser): Parser {
    return (s: Str) => {
        let result = a
        let nfa: NFA[] = []
        let str = s
        let next = a(s)
        while(next) {
            next[0].forEach(n => nfa.push(n))
            str = next[1]
            next = a(str)
        }
        return [nfa, str]
    }
}

export function repeatN(a: Parser, n: number): Parser {
    if (n == 1) {
        return a
    }
    let result = a
    for (let i = 1; i < n; ++i) {
        result = connect(result, a)
    }
    return result
}


function esc(c: number): number {
    if (c == 98) { // b
        return 8
    }
    if (c == 102) { // f
        return 12
    }
    if (c == 110) { // n
        return 10
    }
    if (c == 114) { // r
        return 13
    }
    if (c == 116) { // t
        return 9
    }
    if (c == 118) { // v
        return 11
    }
    if (c == 48) { // 0
        return 0
    }
    return c
}

export function escape(c: string): Parser {
    return (s: Str) => {
        const next = s.nextCharCode()
        if (next && next[0] == c.charCodeAt(0)) {
            return [
                [createSimpleNFA(esc(next[0]))], 
                next[1]
            ]
        }
        return undefined
    }
}

export function any(): Parser {
    return (s: Str) => {
        const next = s.nextCharCode()
        if (next) {
            return [
                [createSimpleNFA(next[0])], 
                next[1]
            ]
        }
        return undefined
    }
}