import { NFA, Path, StateGenerator } from "../nfa";
import { IBuilder } from "./builder"
import StringBuffer from "./stringBuffer";

export default class EscapeBuilder implements IBuilder {
    private s: StringBuffer
    protected gen: StateGenerator

    constructor(s: StringBuffer, gen: StateGenerator) {
        this.s = s
        this.gen = gen
    }

    private hex(c: number): number | undefined {
        if (c >= 97 && c <= 102) {
            // a-f
            return 10 + c - 97
        } else if (c >= 65 && c <= 70) {
            // A-F
            return 10 + c - 65
        } else if (c >= 48 && c <= 57) {
            return c - 48
        }
        return undefined
    }

    private escape(c: number): number {
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
        if (c == 117 && this.s.remaining() >= 4) { // unicode
            let unicode = 0
            for (let i = 0; i < 4; ++i) {
                const h = this.hex(this.s.nextCharCode())
                if (h != undefined) {
                    unicode = 16 * unicode + h
                } else {
                    this.s.skip(-i - 1)
                    return c
                }
            }
            return unicode
        }
        return c
    }

    build(): NFA {
        const c = this.s.nextCharCode()
        if (c) {
            const escape = this.escape(c)

            const state = this.gen.newState()
            state.setTerminal(false)
            const next = this.gen.newState()
            const path = new Path(escape, next)
            state.addPath(path)

            return new NFA(state, [next])
        }
        throw new Error('Imcomplete regular expression.')
    }
    
}