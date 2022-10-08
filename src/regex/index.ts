import Automata from './automata'
import nfaToSvg from './nfa/visualization/svg'
import parseRegex from './parser'

export class Regex {
    automata: Automata

    constructor(automata: Automata) {
        this.automata = automata
    }

    match(s: string): string | undefined {
        let lastAccepted = this.automata.accepted() ? 0 : -1
        for (let i = 0; i < s.length; ++i) {
            const result = this.automata.consume(s.charCodeAt(i))
            if (!result) {
                return this.matchResult(lastAccepted, s)
            } else {
                if (this.automata.accepted()) {
                    lastAccepted = i + 1
                }
            }
        }
        return this.matchResult(lastAccepted, s)
    }

    private matchResult(lastAccepted: number, s: string): string | undefined {
        this.automata.reset()
        if (lastAccepted >= 0) {
            return s.substring(0, lastAccepted)
        }
        return undefined
    }
}

export function createRegex(r: string, debug?: boolean): Regex | undefined {
    try {
        // const nfa = new Builder(r).build()
        const nfa = parseRegex(r)
        if (debug) {
            console.debug(nfaToSvg(nfa))
        }
        return new Regex(nfa)
    } catch(e) {
        console.warn('Failed to parse the regex', e)
    }
    return undefined
}