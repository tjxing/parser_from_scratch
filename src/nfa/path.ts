import State from './state'

export default class Path {
    private char: number
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

    toString(): string {
        const data = {
            char: this.char,
            dest: this.dest.id
        }
        return JSON.stringify(data, null, 2)
    }
}