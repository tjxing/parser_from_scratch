import StringBuffer from "./stringBuffer";
import { NFA, State, Path, StateGenerator } from "../nfa";

export interface IBuilder {
    build(): NFA
}

export class Builder implements IBuilder {
    private s: StringBuffer
    private gen: StateGenerator

    constructor(s: string) {
        this.s = new StringBuffer(s)
        this.gen = new StateGenerator()
    }

    build(): NFA {
        const start = this.gen.newState()
        const nfa = new NFA(start, [start])

        let lastNFA: NFA | undefined = undefined
        let c = this.s.nextChar()
        while(c != undefined) {
            if (c == '(') {

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
                const next = this.gen.newState()
                const path = new Path(c.charCodeAt(0), next)
                state.addPath(path)
                lastNFA = new NFA(state, [state])
            }

            c = this.s.nextChar()
        }

        return nfa
    }
    
}