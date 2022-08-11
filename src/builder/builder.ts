import StringBuffer from "./stringBuffer"
import { NFA, Path, StateGenerator } from "../nfa"
import EscapeBuilder from "./escapeBuilder"
import RangeBuilder from "./rangeBuilder"

export interface IBuilder {
    build(): NFA
}

export class Builder implements IBuilder {
    protected s: StringBuffer
    protected gen: StateGenerator
    protected stopCond: (c: string) => boolean
    protected finishFunc: (last: NFA | undefined, result: NFA) => void

    constructor(s: string) {
        this.s = new StringBuffer(s)
        this.gen = new StateGenerator()
        this.stopCond = (c: string) => c != undefined
        this.finishFunc = (last: NFA | undefined, result: NFA) => {
            if (last) {
                result.connect(last)
            }
        }
    }

    private rules: { [x: string]: (nfa: NFA, last: NFA | undefined) => NFA | undefined } = {
        '(': (nfa: NFA, last: NFA | undefined) => {
            if (last) {
                nfa.connect(last)
            }
            const paranBuilder = new Builder('')
            paranBuilder.s = this.s
            paranBuilder.gen = this.gen
            paranBuilder.stopCond = (c: string) => c != ')'
            paranBuilder.finishFunc = (last: NFA | undefined, result: NFA) => {
                if (!this.s.finished()) {
                    if (last) {
                        result.connect(last)
                    }
                } else {
                    throw new Error('Missing ) in regex')
                }
            }
            return paranBuilder.build()
        },

        '[': (nfa: NFA, last: NFA | undefined) => {
            if (last) {
                nfa.connect(last)
            }
            return new RangeBuilder(this.s, this.gen).build()
        },

        '*': (nfa: NFA, last: NFA | undefined) => {
            if (last) {
                last.repeat()
            }
            return last
        },

        '+': (nfa: NFA, last: NFA | undefined) => {
            if (last) {
                last.repeatAtLeastOnce()
            }
            return last
        },

        '\\': (nfa: NFA, last: NFA | undefined) => {
            if (last) {
                nfa.connect(last)
            }
            return new EscapeBuilder(this.s, this.gen).build()
        }
    }

    build(): NFA {
        const start = this.gen.newState()
        const nfa = new NFA(start, [start])

        let lastNFA: NFA | undefined = undefined
        let c = this.s.nextChar()
        while(this.stopCond(c)) {
            const func = this.rules[c]
            if (func) {
                lastNFA = func(nfa, lastNFA)
            } else {
                if (lastNFA) {
                    nfa.connect(lastNFA)
                }
                const state = this.gen.newState()
                state.setTerminal(false)
                const next = this.gen.newState()
                const path = new Path(c.charCodeAt(0), next)
                state.addPath(path)
                lastNFA = new NFA(state, [next])
            }
            c = this.s.nextChar()
        }
        this.finishFunc(lastNFA, nfa)

        return nfa
    }
    
}