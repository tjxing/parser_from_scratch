import { Selector } from '../selector'
import State from './state'
import { Path as NFAPath } from '../nfa'

export class Path {
    readonly selector: Selector
    readonly dest: State

    constructor(nfaPath: NFAPath) {
        this.selector = nfaPath.selector
        this.dest = new State(nfaPath.dest)
    }

    go(c: number): State | undefined {
        if (this.selector.apply(c)) {
            return this.dest
        }
        return undefined
    }
}