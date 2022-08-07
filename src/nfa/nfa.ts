import State from './state'
import StateGenerator from './stateGenerator'

export default class NFA {
    private start: State
    private terminals: State[]
    private current: State[]

    constructor(start: State, terminals: State[]) {
        this.start = start
        this.terminals = terminals
        this.current = [start]
    }

    consume(c: number): boolean {
        const next: State[] = []
        this.current.forEach(state => {
            state.consume(c).forEach(s => next[s.id] = s)
        })
        this.current = next
        return next.length > 0
    }

    accepted(): boolean {
        return this.current.find(s => s.isTerminal()) != undefined
    }

    reset() {
        this.current = [this.start]
    }

    connect(other: NFA) {
        this.terminals.forEach(t => {
            t.setTerminal(false)
            t.addClosure(other.start)
        })
        this.terminals = other.terminals
    }

    or(other: NFA) {
        this.start.addClosure(other.start)

        const terminals: State[] = []
        this.terminals.forEach(t => terminals[t.id] = t)
        other.terminals.forEach(t => terminals[t.id] = t)
        this.terminals = []
        terminals.forEach(t => this.terminals.push(t))
    }

    repeat() {
        this.start.setTerminal(true)
        let found = false
        this.terminals.forEach(t => {
            if (t.id != this.start.id) {
                t.addClosure(this.start)
            } else {
                found = true
            }
        })
        if (!found) {
            this.terminals.push(this.start)
        }
    }

    repeatAtLeastOnce() {
        this.terminals.forEach(t => {
            if (t.id != this.start.id) {
                t.addClosure(this.start)
            }
        })
    }

}