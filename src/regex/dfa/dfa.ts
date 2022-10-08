import Automata from '../automata'
import { NFA } from '../nfa'
import State from './state'

export default class DFA implements Automata {
    readonly start: State
    private current: State

    constructor(nfa: NFA) {
        this.start = new State(nfa.start)
        
        buildFromState(this.start, {})
    }

    consume(c: number): boolean {
        throw new Error('Method not implemented.')
    }
    
    accepted(): boolean {
        throw new Error('Method not implemented.')
    }

    reset(): void {
        throw new Error('Method not implemented.')
    }
}

function buildFromState(state: State, cache: { [x: string]: State }) {
    if (cache[state.id] == undefined) {
        cache[state.id] = state
    }
}