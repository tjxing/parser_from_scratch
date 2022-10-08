import { Selector } from '../selector'
import State from './state'

export class Path {
    readonly selector: Selector
    readonly dest: State

    constructor(selector: Selector, dest: State) {
        this.selector = selector
        this.dest = dest
    }

    go(c: number): State | undefined {
        if (this.selector.apply(c)) {
            return this.dest
        }
        return undefined
    }
}