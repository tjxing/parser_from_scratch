import { CharSelector, RangeSelector, Selector, blankSelector, nonBlankSelector, wSelector, anySelector } from './selector'
import State from './state'

export default class Path {
    private selector: Selector
    readonly dest: State

    constructor(dest: State, c1: number | 's' | 'S' | 'w' | '.', c2?: number) {
        if (c2) {
            this.selector = new RangeSelector(c1 as number, c2)
        } else if (c1 === 's') {
            this.selector = new blankSelector()
        } else if (c1 === 'S') {
            this.selector = new nonBlankSelector()
        } else if (c1 === 'w') {
            this.selector = new wSelector()
        } else if (c1 === '.') {
            this.selector = new anySelector()
        } else {
            this.selector = new CharSelector(c1 as number)
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