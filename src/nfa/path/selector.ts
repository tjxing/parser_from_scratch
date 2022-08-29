import Range from './range'

export class Selector {
    readonly ranges: Range[]
    readonly name: string

    constructor(name: string) {
        this.name = name
        this.ranges = []
    }

    apply(c: number): boolean {
        for (const i in this.ranges) {
            if (this.ranges[i].isIn(c)) {
                return true
            }
        }
        return false
    }

    addRange(range: Range) {
        this.ranges.push(range)
    }

    toString(): string {
        return this.name
    }
}

export class CharSelector extends Selector {
    constructor(c: number) {
        super(String.fromCharCode(c))
        this.addRange(new Range(c, c))
    }
}

export class RangeSelector extends Selector {
    constructor(x: number, y: number) {
        super(String.fromCharCode(x) + '-' + String.fromCharCode(y))
        this.addRange(new Range(x, y))
    }
}

export class BlankSelector extends Selector {
    constructor() {
        super('\\s')
        this.addRange(new Range(9, 9))   // \t
        this.addRange(new Range(10, 10)) // \n
        this.addRange(new Range(11, 11)) // \v
        this.addRange(new Range(12, 12)) // \f
        this.addRange(new Range(13, 13)) // \r
    }
}

export class NonBlankSelector extends Selector {
    constructor() {
        super('\\S')
        this.addRange(new Range(0, 8))
        this.addRange(new Range(14, Infinity))
    }
}

export class LetterSelector extends Selector {
    constructor() {
        super('\\w')
        this.addRange(new Range(49, 57))  // 0-9
        this.addRange(new Range(65, 90))  // A-Z
        this.addRange(new Range(97, 122)) // a-z
    }
}

export class AnySelector extends Selector {
    constructor() {
        super('.')
        this.addRange(new Range(0, 9))   // 10 - \n
        this.addRange(new Range(11, 12)) // 13 - \r
        this.addRange(new Range(14, Infinity))
    }
}

export class MergedSelector extends Selector {
    private text: string
    private isNot: boolean

    constructor(selectors: Selector[]) {
        super('')

        selectors.forEach(s => s.ranges.forEach(r => this.addRange(r)))
        this.mergeRange()

        this.text = selectors.map(s => s.toString()).join('')
        this.isNot = false
    }

    private mergeRange() {
        if (this.ranges.length > 1) {
            this.ranges.sort((x, y) => x.left - y.left)

            const ranges: Range[] = []
            let left = this.ranges[0].left
            let right = this.ranges[0].right
            for (let i = 1; i < this.ranges.length; ++i) {
                if (this.ranges[i].left > right + 1) {
                    ranges.push(new Range(left, right))
                    left = this.ranges[i].left
                    right = this.ranges[i].right
                } else if (this.ranges[i].right > right) {
                    right = this.ranges[i].right
                }
            }
            ranges.push(new Range(left, right))

            this.ranges.splice(0, this.ranges.length)
            ranges.forEach(r => this.ranges.push(r))
        }
    }

    not() {
        const ranges: Range[] = []

        let left = -1
        for (const i in this.ranges) {
            ++left
            if (this.ranges[i].left != left) {
                ranges.push(new Range(left, this.ranges[i].left - 1))
            }
            left = this.ranges[i].right
        }
        if (left != Infinity) {
            ranges.push(new Range(left, Infinity))
        }

        this.ranges.splice(0, this.ranges.length)
        ranges.forEach(r => this.ranges.push(r))

        this.isNot = !this.isNot
    }

    toString(): string {
        return (this.isNot ? '[^' : '[') + this.text + ']'
    }
}