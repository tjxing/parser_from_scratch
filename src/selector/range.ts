export default class Range {
    readonly left: number
    readonly right: number

    constructor(x: number, y: number) {
        if (x < y) {
            this.left = x
            this.right = y
        } else {
            this.left = y
            this.right = x
        }
    }

    isIn(c: number): boolean {
        return c >= this.left && c <= this.right
    }
}