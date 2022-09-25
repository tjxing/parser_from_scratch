import { State as NFAState } from '../nfa'
import { Path } from './path'

export default class State {
    readonly id: string
    private nfaStates: NFAState[]
    private paths: Path[]

    constructor(nfaState: NFAState) {
        const closure: NFAState[] = []
        addToClosure(nfaState, closure)

        this.nfaStates = []
        closure.forEach(s => this.nfaStates.push(s))
    
        this.id = this.nfaStates
            .map(s => s.id)
            .sort((a, b) => a - b)
            .join(',')
    }
}

function addToClosure(state: NFAState, closure: NFAState[]) {
    if (closure[state.id] == undefined) {
        closure[state.id] = state
        state.forEachClosure(s => this.addToClosure(s, closure))
    }
}