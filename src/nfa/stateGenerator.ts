import State from "./state"

export default class StateGenerator {
    private id:number = 0

    newState(): State {
        return new State(this.id++)
    }
}