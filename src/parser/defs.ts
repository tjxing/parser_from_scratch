import { NFA } from "../nfa"
import { Parser, char, connect, or, repeat, createSimpleNFA, range, repeatN, escape, not, any, NumParser, orNum, num, connectNum, escapeNum, anyNum, notNum, createRangeNFA } from "./base"
import Str from "./str"


const escapeNumParser: NumParser = (s: Str) => {
    const p = connectNum(
        num('\\'.charCodeAt(0)), 
        orNum(
            escapeNum('b'), 
            escapeNum('f'), 
            escapeNum('n'), 
            escapeNum('r'), 
            escapeNum('t'), 
            escapeNum('v'), 
            escapeNum('0'),
            anyNum()
        )
    )
    const next = p(s)
    if (next) {
        return [[next[0][1]], next[1]]
    }
    return undefined
}

const escapeParser: Parser = (s: Str) => {
    const result = escapeNumParser(s)
    if (result) {
        return [[createSimpleNFA(result[0][0])], result[1]]
    }
    return undefined
}

const hexParser: NumParser = orNum(
    range(97, 102), // a-f
    range(65, 70), // A-F
    range(48, 57) // 0-9
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

const unicodeNumParser: NumParser = (s: Str) => {
    const p = connectNum(
        num('\\'.charCodeAt(0)),
        num('u'.charCodeAt(0)),
        repeatN(hexParser, 4)
    )
    const next = p(s)
    if (next) {
        let num = 0
        for (let i = 2; i < 6; ++i) {
            num = 16 * num + hex(next[0][i])
        }
        return [[num], next[1]]
    }
    return undefined
}

const unicodeParser: Parser = (s: Str) => {
    const next = unicodeNumParser(s)
    if (next) {
        return [[createSimpleNFA(next[0][0])], next[1]]
    }
    return undefined
}

const letterParser = not('(', ')', '[', ']', '*', '+', '\\', '|')

const paranParser: Parser = (s: Str) => {
    const p = connect(
        char('('),
        expressionParser,
        char(')')
    )
    const result = p(s)
    if (result) {
        return [[result[0][1]], result[1]]
    }
    return undefined
}

const rangeNumParser: NumParser = orNum(
    unicodeNumParser,
    escapeNumParser,
    notNum(']')
)

const rangeLetterParser: Parser = (s: Str) => {
    const result = rangeNumParser(s)
    if (result) {
        return [[createSimpleNFA(result[0][0])], result[1]]
    }
    return undefined
}

const rangeParser: Parser = (s: Str) => {
    const p = connectNum(
        rangeNumParser,
        num('-'.charCodeAt(0)),
        rangeNumParser
    )
    const result = p(s)
    if (result) {
        const x = result[0][0]
        const y = result[0][2]
        if (x > y) {
            throw new Error('Invalid range at ' + s.index)
        }
        return [[createRangeNFA(x, y)], result[1]]
    }
    return undefined
}

const bracketParser: Parser = (s: Str) => {
    const p = connect(
        char('['),
        repeat(or(
            rangeParser,
            rangeLetterParser
        )),
        char(']')
    )
    const result = p(s)
    if (result && result[0].length > 2) {
        let nfa = result[0][1]
        for (let i = 2; i < result[0].length - 1; ++i) {
            nfa = nfa.or(result[0][i])
        }
        return [[nfa], result[1]]
    }
    return undefined
}

const blankParser: Parser = (s: Str) => {
    const p = connect(
        char('\\'),
        char('s')
    )
    const result = p(s)
    if (result) {
        return [[createSimpleNFA('s')], result[1]]
    }
    return undefined
}

const nonBlankParser: Parser = (s: Str) => {
    const p = connect(
        char('\\'),
        char('S')
    )
    const result = p(s)
    if (result) {
        return [[createSimpleNFA('S')], result[1]]
    }
    return undefined
}

const wParser: Parser = (s: Str) => {
    const p = connect(
        char('\\'),
        char('w')
    )
    const result = p(s)
    if (result) {
        return [[createSimpleNFA('w')], result[1]]
    }
    return undefined
}

const anyParser: Parser = (s: Str) => {
    const p = char('.')
    const result = p(s)
    if (result) {
        return [[createSimpleNFA('.')], result[1]]
    }
    return undefined
}

const wordParser: Parser = or(
    paranParser,
    bracketParser,
    unicodeParser,
    blankParser,
    nonBlankParser,
    wParser,
    escapeParser,
    anyParser,
    letterParser
)

const starParser: Parser = (s: Str) => {
    const p = connect(wordParser, char('*'))
    const next = p(s)
    if (next) {
        return [[next[0][0].repeat()], next[1]]
    }
    return undefined
}

const plusParser: Parser = (s: Str) => {
    const p = connect(wordParser, char('+'))
    const next = p(s)
    if (next) {
        return [[next[0][0].repeatAtLeastOnce()], next[1]]
    }
    return undefined
}

const questionParser: Parser = (s: Str) => {
    const p = connect(wordParser, char('?'))
    const next = p(s)
    if (next) {
        return [[next[0][0].repeatAtMostOnce()], next[1]]
    }
    return undefined
}

const factorParser: Parser = or(
    starParser,
    plusParser,
    questionParser,
    wordParser
)

const orParser: Parser = (s: Str) => {
    const p = connect(
        factorParser,
        char('|'),
        wordParser
    )
    const result = p(s)
    if (result) {
        return [[result[0][0].or(result[0][2])], result[1]]
    }
    return undefined
}

const termParser: Parser = or(
    orParser,
    factorParser
)

const expressionParser: Parser = (s: Str) => {
    const p = repeat(termParser)
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