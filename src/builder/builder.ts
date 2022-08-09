import StringBuffer from "./stringBuffer"
import { NFA, Path, StateGenerator } from "../nfa"

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

    build(): NFA {
        const start = this.gen.newState()
        const nfa = new NFA(start, [start])

        let lastNFA: NFA | undefined = undefined
        let c = this.s.nextChar()
        while(this.stopCond(c)) {
            if (c == '(') {
                if (lastNFA) {
                    nfa.connect(lastNFA)
                }
                const paranBuilder = new Builder('')
                paranBuilder.s = this.s
                paranBuilder.gen = this.gen
                paranBuilder.stopCond = (c: string) => c != ')'
                paranBuilder.finishFunc = (last: NFA | undefined, result: NFA) => {
                    if (c) {
                        if (last) {
                            result.connect(last)
                        }
                    } else {
                        throw new Error('Missing ) in regex')
                    }
                }
                lastNFA = paranBuilder.build()
            } else if (c == '[') {

            } else if (c == '*') {
                if (lastNFA) {
                    lastNFA.repeat()
                }
            } else if (c == '+') {
                if (lastNFA) {
                    lastNFA.repeatAtLeastOnce()
                }
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