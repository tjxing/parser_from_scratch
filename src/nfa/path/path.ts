import State from '../state'
import { AnySelector, BlankSelector, CharSelector, LetterSelector, NonBlankSelector, RangeSelector, Selector } from './selector'

export default class Path {
    readonly selector: Selector
    readonly dest: State

    constructor(dest: State, c1: number | 's' | 'S' | 'w' | '.' | Selector, c2?: number) {
        if (c2) {
            this.selector = new RangeSelector(c1 as number, c2)
        } else if (typeof c1 == 'number') {
            this.selector = new CharSelector(c1 as number)
        } else if (c1 === 's') {
            this.selector = new BlankSelector()
        } else if (c1 === 'S') {
            this.selector = new NonBlankSelector()
        } else if (c1 === 'w') {
            this.selector = new LetterSelector()
        } else if (c1 === '.') {
            this.selector = new AnySelector()
        } else {
            this.selector = c1
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