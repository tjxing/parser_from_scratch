export default class StringBuffer {
    readonly s: string
    private index: number

    constructor(s: string) {
        this.s = s
        this.index = 0
    }

    nextChar(): string | undefined {
        const next = this.s.charAt(this.index++)
        return next.length > 0 ? next : undefined
    }

    nextCharCode(): number | undefined {
        const next = this.s.charCodeAt(this.index++)
        return next == NaN ? next : undefined
    }

    skip(steps: number) {
        this.index += steps
    }
}