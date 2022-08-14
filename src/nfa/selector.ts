export interface Selector {
    apply(c: number): boolean
    toString(): string
}

export class CharSelector implements Selector {
    private char: number

    constructor(char: number) {
        this.char = char
    }

    apply(c: number): boolean {
        return this.char == c
    }

    toString(): string {
        return String.fromCharCode(this.char)
    }
}

export class RangeSelector implements Selector {
    private x: number
    private y: number

    constructor(x: number, y: number) {
        if (x <y) {
            this.x = x
            this.y = y
        } else {
            this.x = y
            this.y = x
        }
    }

    apply(c: number): boolean {
        return c >= this.x && c <= this.y
    }

    toString(): string {
        return String.fromCharCode(this.x) + '-' + String.fromCharCode(this.y)
    }
}