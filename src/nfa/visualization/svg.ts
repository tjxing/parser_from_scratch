import NFA from "../nfa"
import State from "../state"

/**
 * Generate a SVG image for NFA
 * This module is only for debugging
 * Don't use it in production
 */
const STATE_DIST = 100
const RADIUS = 25
const [ X, Y ] = [ 30, 30 ]
const CHAR_SIZE = 12
const ARROW_SIZE = 5

class StateItem {
    id: number
    x: number
    y: number
    terminal: boolean

    constructor(id: number, terminal: boolean) {
        this.id = id
        this.x = 0
        this.terminal = terminal
    }

    toString(i: number): string {
        this.x = X + i * STATE_DIST
        const fill = this.terminal ? 'yellow' : 'white'
        let result = 
            `<g>` +
                `<path id="text-path-${this.id}" d="M${this.x - RADIUS},${Y},${this.x + RADIUS},${Y}"/>` +
                `<circle cx="${this.x}" cy="${Y}" r="${RADIUS}" stroke="blue" fill="${fill}"/>` +
                `<text style="font-size:16;stroke:red;text-anchor:middle;dominant-baseline:middle">` + 
                    `<textPath xlink:href="#text-path-${this.id}" startOffset="50%">${this.id}</textPath>` + 
                `</text>` +
            `</g>`
        return result
    }
}

class PathItem {
    from: StateItem
    to: StateItem
    char: string | undefined

    constructor(from: StateItem, to: StateItem, char: string | undefined) {
        this.from = from
        this.to = to
        this.char = char
    }

    distance(): number {
        return Math.abs(this.from.x - this.to.x)
    }

    toString(i: number, c: number): string {
        const [ left, right, dist ] = this.from.x < this.to.x ? 
            [ this.from.x, this.to.x, this.to.x - this.from.x ] :
            [ this.to.x, this.from.x, this.from.x - this.to.x ]
        const dash = this.char != undefined ? '' : 'stroke-dasharray="3 2"'
        if (dist == STATE_DIST && c == 0) {
            const text = this.char == undefined ? '' :
                `<path id="number-path-${i}" d="M${left + RADIUS},${Y - CHAR_SIZE/2 -2},${right - RADIUS},${Y - CHAR_SIZE/2 -2}"/>` +
                `<text style="font-size:${CHAR_SIZE};stroke:black;text-anchor:middle;dominant-baseline:middle">` +
                    `<textPath xlink:href="#number-path-${i}" startOffset="50%">${this.char}</textPath>` + 
                `</text>`
            const arrow = this.from.x < this.to.x ? 
                `<polyline points="${this.to.x - RADIUS - ARROW_SIZE},${Y - ARROW_SIZE},${this.to.x - RADIUS},${Y},${this.to.x - RADIUS - ARROW_SIZE},${Y + ARROW_SIZE}" stroke="blue" stroke-width="2"/>` : 
                `<polyline points="${this.to.x + RADIUS + ARROW_SIZE},${Y - ARROW_SIZE},${this.to.x + RADIUS},${Y},${this.to.x + RADIUS + ARROW_SIZE},${Y + ARROW_SIZE}" stroke="blue" stroke-width="2"/>`
            const result = 
                `<g>` +
                    `<line x1="${left + RADIUS}" y1="${Y}" x2="${right - RADIUS}" y2="${Y}" stroke="blue" stroke-width="2" ${dash}/>` +
                    text +
                    arrow +
                `</g>`
            return result
        } else {
            const h = dist + c * STATE_DIST
            const text = this.char == undefined ? '' :
                `<path id="number-path-${i}" d="M${left},${Y + RADIUS - CHAR_SIZE/2 - 2 + h/4},${right},${Y + RADIUS - CHAR_SIZE/2 - 2 + h/4}"/>` +
                `<text style="font-size:${CHAR_SIZE};stroke:black;text-anchor:middle;dominant-baseline:middle">` +
                    `<textPath xlink:href="#number-path-${i}" startOffset="50%">${this.char}</textPath>` + 
                `</text>`
            const arrow = this.from.x < this.to.x ? 
                `<polyline points="${this.to.x - ARROW_SIZE},${Y + RADIUS - ARROW_SIZE},${this.to.x},${Y + RADIUS},${this.to.x - ARROW_SIZE},${Y + RADIUS + ARROW_SIZE}" stroke="blue" stroke-width="2" ` +
                    `transform="rotate(-45,${this.to.x},${Y + RADIUS})"/>` : 
                `<polyline points="${this.to.x + ARROW_SIZE},${Y + RADIUS - ARROW_SIZE},${this.to.x},${Y + RADIUS},${this.to.x + ARROW_SIZE},${Y + RADIUS + ARROW_SIZE}" stroke="blue" stroke-width="2" ` +
                    `transform="rotate(45,${this.to.x},${Y + RADIUS})"/>`
            const result = 
                `<g>` +
                    `<path d="M ${left} ${Y + RADIUS} q ${dist / 2} ${h / 2} ${dist} 0" stroke="blue" stroke-width="2" fill="none" ${dash}/>` +
                    text +
                    arrow +
                `</g>`
            return result
        }
    }
}

class SVG {
    stateCount: number
    states: StateItem[]
    paths: PathItem[]

    constructor() {
        this.stateCount = 0
        this.states = []
        this.paths = []
    }

    toString(): string {
        let result = ''
        for (let i = 0; i < this.stateCount; ++i) {
            result += this.states[i].toString(i)
        }

        const count: { [x: string]: number } = {}
        let maxDist = 0
        this.paths.forEach((p, i) => {
            const [ left, right, dist ] = p.from.x < p.to.x ? 
                [ p.from, p.to, p.to.x - p.from.x ] :
                [ p.to, p.from, p.from.x - p.to.x ]
            const key = left.id + ',' + right.id
            let c = count[key]
            c = (c == undefined) ? 0 : c + 1
            count[key] = c

            const d = dist + c * STATE_DIST
            if (d > maxDist) {
                maxDist = d
            }
            result += p.toString(i, c)
        })

        const width = 2 * X + (this.stateCount - 1) * STATE_DIST
        const height = 2 * Y + RADIUS + maxDist / 4
        result = 
            `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg" version="1.1">` + 
                result + 
            '</svg>'
        return result
    }
}

function handleState(state: State, svg: SVG, next: State[]): StateItem {
    if (svg.states[state.id] == undefined) {
        const result = new StateItem(state.id, state.isTerminal())
        svg.states[state.id] = result
        ++svg.stateCount

        state.forEachPath(p => {
            svg.paths.push(new PathItem(result, 
                handleState(p.dest, svg, next), p.char()))
            next.push(p.dest)
        })
        state.forEachClosure(c => {
            svg.paths.push(new PathItem(result, 
                handleState(c, svg, next), undefined))
            next.push(c)
        })

        return result
    }
    return svg.states[state.id]
}

export default function nfaToSvg(nfa: NFA): string {
    const svg = new SVG()
    let buff = [nfa.start]
    while(buff.length > 0) {
        const next: State[] = []
        buff.forEach(s => {
            handleState(s, svg, next)
        })
        buff = next
    }
    svg.states.sort((a, b) => a.id - b.id)
    return svg.toString()
}