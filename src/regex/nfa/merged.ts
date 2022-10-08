import NFA from './nfa'
import { MergedPath, Path } from './path'
import State from './state'

export default class MergedNFA extends NFA {
    private path: MergedPath

    constructor(nfa: NFA[], start: State, dest: State) {
        super(start, [dest])

        start.setTerminal(false)
        dest.setTerminal(true)

        const paths: Path[] = []
        nfa.map(n => n.start).forEach(s => s.forEachPath(p => paths.push(p)))
        this.path = new MergedPath(dest, paths)

        start.addPath(this.path)
    }

    not(): NFA {
        this.path.not()
        return this
    }
}