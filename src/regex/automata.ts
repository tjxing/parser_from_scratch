export default interface Automata {

    consume(c: number): boolean

    accepted(): boolean

    reset(): void

}