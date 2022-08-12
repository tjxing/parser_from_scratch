import { State } from "../nfa"

class StateGenerator {
    private id:number = 0

    newState(): State {
        return new State(this.id++)
    }
}

export default new StateGenerator()