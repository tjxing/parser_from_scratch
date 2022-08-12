import { NFA } from "../nfa"
import { Parser, charParser, connect, or, repeat, createSimpleNFA, rangeParser, repeatN, escape, not, any } from "./base"
import Str from "./str"


const escapeParser: Parser = (s: Str) => {
    const p = connect(
        charParser('\\'), 
        or(
            escape('b'), 
            escape('f'), 
            escape('n'), 
            escape('r'), 
            escape('t'), 
            escape('v'), 
            escape('0'),
            any()
        )
    )
    const next = p(s)
    if (next) {
        return [[next[0][1]], next[1]]
    }
    return undefined
}

const hexParser: Parser = or(
    rangeParser(97, 102), // a-f
    rangeParser(65, 70), // A-F
    rangeParser(48, 57) // A-F
)

function hex(c: number): number {
    if (c >= 97 && c <= 102) {
        // a-f
        return 10 + c - 97
    } else if (c >= 65 && c <= 70) {
        // A-F
        return 10 + c - 65
    } else if (c >= 48 && c <= 57) {
        return c - 48
    }
    return -1
}

const unicodeParser: Parser = (s: Str) => {
    const p = connect(
        charParser('\\'),
        charParser('u'),
        repeatN(hexParser, 4)
    )
    const next = p(s)
    if (next) {
        let str = s.skip(2)
        let num = 0
        for (let i = 0; i < 4; ++i) {
            const [c, ss] = str.nextCharCode()
            num = 16 * num + hex(c)
            str = ss
        }
        return [[createSimpleNFA(num)], str]
    }
    return undefined
}

const letterParser = not('(', ')', '[', ']', '*', '+', '\\')

const paranParser: Parser = (s: Str) => {
    const p = connect(
        charParser('('),
        expressionParser,
        charParser(')')
    )
    const result = p(s)
    if (result) {
        return [[result[0][1]], result[1]]
    }
    return undefined
}

const termParser: Parser = or(
    paranParser,
    unicodeParser,
    escapeParser,
    letterParser
)

const starParser: Parser = (s: Str) => {
    const p = connect(termParser, charParser('*'))
    const next = p(s)
    if (next) {
        return [[next[0][0].repeat()], next[1]]
    }
    return undefined
}

const plusParser: Parser = (s: Str) => {
    const p = connect(termParser, charParser('+'))
    const next = p(s)
    if (next) {
        return [[next[0][0].repeatAtLeastOnce()], next[1]]
    }
    return undefined
}

const wordParser: Parser = or(
    starParser,
    plusParser,
    termParser
)

const expressionParser: Parser = (s: Str) => {
    const p = repeat(wordParser)
    const result = p(s)
    if (result) {
        const nfa = result[0].reduce((a, b) => a.connect(b))
        return [[nfa], result[1]]
    }
    return undefined
}

export default function parseRegex(s: string): NFA {
    const result = expressionParser(new Str(s, 0))
    if (result) {
        if (result[1].finished()) {
            return result[0][0]
        } else {
            throw new Error('Error in expression at ' + result[1].index)
        }
    }
    throw new Error('Invalid regular expression.')
}