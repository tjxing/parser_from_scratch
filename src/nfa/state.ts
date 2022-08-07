import Path from "./path";

export default class State {
    readonly id: number
    private paths: Path[]
    private closures: State[]
    private terminal: boolean;

    constructor(id: number) {
        this.id = id
        this.paths = []
        this.closures = []
        this.terminal = true
    }

    consume(c: number): State[] {
        const result: State[] = []

        this.paths.forEach(path => {
            const next = path.go(c)
            if (next) {
                result[next.id] = next
            }
        })
        this.closures.forEach(closure => {
            closure.consume(c).forEach(state => {
                result[state.id] = state
            })
        })

        let toCheck = result
        while (toCheck.length > 0) {
            const toAdd: State[] = []
            toCheck.forEach(state => {
                state.closures.forEach(c => toAdd.push(c))
            })
            toAdd.forEach(state => result[state.id] = state)
            toCheck = toAdd
        }

        return result
    }

    isTerminal(): boolean {
        return this.terminal
    }

    setTerminal(terminal: boolean) {
        this.terminal = terminal
    }

    addPath(path: Path) {
        this.paths.push(path)
    }

    forEachPath(func: (p: Path) => void) {
        this.paths.forEach(p => func(p))
    }

    addClosure(s: State) {
        this.closures[s.id] = s
    }

    forEachClosure(func: (s: State) => void) {
        this.closures.forEach(s => func(s))
    }
}
