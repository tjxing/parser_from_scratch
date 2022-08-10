import State from './state'

export default class Path {
    readonly char: number
    readonly dest: State

    constructor(char: number, dest: State) {
        this.char = char
        this.dest = dest
    }

    go(c: number): State | undefined {
        if (this.char == c) {
            return this.dest
        }
        return undefined
    }
}