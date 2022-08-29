import State from '../state'
import Path from './path'
import { MergedSelector } from './selector'

export default class MergedPath extends Path {
    constructor(dest: State, paths: Path[]) {
        super(dest, new MergedSelector(paths.map(p => p.selector)))
    }

    not() {
        (this.selector as MergedSelector).not()
    }
}