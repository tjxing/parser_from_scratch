import { CharSelector, RangeSelector, Selector } from './selector'
import State from './state'

export default class Path {
    private selector: Selector
    readonly dest: State

    constructor(dest: State, c1: number, c2?: number) {
        if (c2) {
            this.selector = new RangeSelector(c1, c2)
        } else {
            this.selector = new CharSelector(c1)
        }
        this.dest = dest
    }

    go(c: number): State | undefined {
        if (this.selector.apply(c)) {
            return this.dest
        }
        return undefined
    }

    char(): string {
        return this.selector.toString()
    }
}