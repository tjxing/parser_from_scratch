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

export class blankSelector implements Selector {
    apply(c: number): boolean {
        return c == 12 // \f
            || c == 10 // \n
            || c == 13 // \r
            || c == 9  // \t
            || c == 11 // \v
    }

    toString(): string {
        return '\\s'
    }
}

export class nonBlankSelector implements Selector {
    apply(c: number): boolean {
        return c != 12 // \f
            && c != 10 // \n
            && c != 13 // \r
            && c != 9  // \t
            && c != 11 // \v
    }

    toString(): string {
        return '\\S'
    }
}

export class wSelector implements Selector {
    apply(c: number): boolean {
        return (c >= 49 && c <= 57)  // 0-9
            || (c >= 65 && c <= 90)  // A-Z
            || (c >= 97 && c <= 122) // a-z
    }

    toString(): string {
        return '.'
    }
}

export class anySelector implements Selector {
    apply(c: number): boolean {
        return c != 10  // \n
            && c != 13  // \r
    }

    toString(): string {
        return '\\w'
    }
}

export class NotSelector implements Selector {
    private selectors: Selector[]

    constructor(selectors: Selector[]) {
        this.selectors = selectors
    }

    apply(c: number): boolean {
        for (const i in this.selectors) {
            if (this.selectors[i].apply(c)) {
                return false
            }
        }
        return true
    }

    toString(): string {
        let s = ''
        for (const i in this.selectors) {
            s += this.selectors[i].toString()
        }
        return '[^' + s + ']'
    }
    
}