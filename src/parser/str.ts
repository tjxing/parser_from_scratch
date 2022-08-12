export default class Str {
    readonly s: string
    readonly index: number

    constructor(s: string, index: number) {
        this.s = s
        this.index = index
    }

    nextChar(): [c: string, s: Str] | undefined {
        const c = this.s.charAt(this.index)
        return c.length > 0 ? [c, new Str(this.s, this.index + 1)] : undefined
    }

    nextCharCode(): [c: number, s: Str] | undefined {
        const c = this.s.charCodeAt(this.index)
        return !isNaN(c) ? [c, new Str(this.s, this.index + 1)] : undefined
    }

    finished(): boolean {
        return this.index >= this.s.length
    }

    remaining(): number {
        const result = this.s.length - this.index
        return result < 0 ? 0 : result
    }

    skip(steps: number): Str {
        return new Str(this.s, this.index + steps)
    }
}