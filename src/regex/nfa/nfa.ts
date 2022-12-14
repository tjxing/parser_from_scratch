import State from './state'
import Automata from '../automata'

export default class NFA implements Automata {
    readonly start: State
    protected terminals: State[]
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
        for (const i in this.current) {
            if (this.current[i].isTerminal()) {
                return true
            }
        }
        return false
    }

    reset() {
        this.current = [this.start]
    }

    connect(other: NFA): NFA {
        if (other.start.inputCount() > 0) {
            this.terminals.forEach(t => {
                t.setTerminal(false)
                t.addClosure(other.start)
            })
            this.terminals = other.terminals
        } else {
            this.terminals.forEach(t => {
                t.setTerminal(other.start.isTerminal())
                other.start.forEachPath(p => t.movePath(p))
                other.start.forEachClosure(c => t.moveClosure(c))
            })
            
            if (other.start.isTerminal()) {
                const terminals: State[] = []
                other.terminals.forEach(t => {
                    if (t.id != other.start.id) {
                        terminals.push(t)
                    }
                })
                this.terminals.forEach(t => terminals.push(t))
                this.terminals = terminals
            } else {
                this.terminals = other.terminals
            }
        }
        return this
    }

    or(other: NFA): NFA {
        this.start.addClosure(other.start)

        const terminals: State[] = []
        this.terminals.forEach(t => terminals[t.id] = t)
        other.terminals.forEach(t => terminals[t.id] = t)
        this.terminals = []
        terminals.forEach(t => this.terminals.push(t))
    
        return this
    }

    repeat(): NFA {
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

        return this
    }

    repeatAtLeastOnce(): NFA {
        this.terminals.forEach(t => {
            if (t.id != this.start.id) {
                t.addClosure(this.start)
            }
        })
        return this
    }

    repeatAtMostOnce(): NFA {
        this.start.setTerminal(true)
        if (this.terminals.find(t => t.id == this.start.id) == undefined) {
            this.terminals.push(this.start)
        }
        return this
    }
}