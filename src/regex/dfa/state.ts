import { State as NFAState } from '../nfa'
import { Path } from './path'

export default class State {
    readonly id: string
    private nfaStates: NFAState[]
    private paths: Path[]

    constructor(nfaState1: NFAState | State, nfaState2?: State) {
        const closure: NFAState[] = []
        if (nfaState1 instanceof NFAState) {
            addToClosure(nfaState1, closure)
        } else if (nfaState2 && nfaState1 instanceof State) {
            nfaState1.nfaStates.forEach(s => closure[s.id] = s)
            nfaState2.nfaStates.forEach(s => closure[s.id] = s)
        } else {
            throw new Error("Illegal arguments")
        }

        this.nfaStates = []
        closure.forEach(s => this.nfaStates.push(s))
    
        this.id = this.nfaStates
            .map(s => s.id)
            .sort((a, b) => a - b)
            .join(',')
    }

    buildPaths(cache: { [x: string]: State }) {
        const paths: Path[] = []
        this.nfaStates.forEach(
            s => s.forEachPath(p => {
                let state = new State(s)
                if (cache[state.id]) {
                    state = cache[state.id]
                }
                const path = new Path(p.selector, state)
                paths.push(path)
            })
        )
    }
}

function addToClosure(state: NFAState, closure: NFAState[]) {
    if (closure[state.id] == undefined) {
        closure[state.id] = state
        state.forEachClosure(s => this.addToClosure(s, closure))
    }
}