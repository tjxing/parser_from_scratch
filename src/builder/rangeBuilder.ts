import { NFA, StateGenerator } from "../nfa";
import { IBuilder } from "./builder";
import StringBuffer from "./stringBuffer";

export default class RangeBuilder implements IBuilder {
    private s: StringBuffer
    private gen: StateGenerator

    constructor(s: StringBuffer, gen: StateGenerator) {
        this.s = s
        this.gen = gen
    }
    
    build(): NFA {
        throw new Error("Method not implemented.");
    }
}