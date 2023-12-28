// import escape from 'npm:html-es6cape@2.0.2' // This isn't working for some reason.
import escape from './libs/html-es6cape.ts'

const htmlPrototype = Object.getPrototypeOf(html)
const GeneratorFunction = function*(){}.constructor

export function isHtml(value: unknown): value is (ReturnType<typeof html>) {
    return value?.constructor === htmlPrototype
}

function* typeChecker(sub: unknown, isRawHtml: boolean): unknown {
    const type = typeof sub
    if (sub == null || sub === false) {
        // Skip this.
    } else if (type === "string") {
        yield isRawHtml ? sub : escape(<string>sub)
    } else if (type === "number") {
        yield ""+sub
    // @ts-ignore we know that sub is a generator.
    } else if (Array.isArray(sub) || (sub instanceof GeneratorFunction && (sub = sub()))) {
        // @ts-ignore we know that sub is a generator or array.
        for (const s of sub) {
            // @ts-ignore Yes, it is of type unknown.
            for (const x of typeChecker(s, isRawHtml)) {
                yield x
            }
        }
    } else if (sub instanceof Function) {
        // @ts-ignore sub is unknown and that is correct.
        for (const s of typeChecker(sub(), isRawHtml)) {
            yield s
        }
    // @ts-ignore we know that sub is a generator.
    } else if (sub.constructor === htmlPrototype) {
        for (const s of <Generator>sub) {
            yield s
        }
    } else {
        // @ts-ignore sub is unknown and that is correct.
        yield isRawHtml ? sub.toString() : escape(sub.toString())
    }
}

function* html(literals: TemplateStringsArray, ...subs: unknown[]) {
    const lits = literals.raw, length = lits.length
    let isRawHtml = true
    for (let i = 0; i < length; i++) {
        let lit = lits[i]
        const sub = subs[i - 1]
        // @ts-ignore sub is unknown and that is correct.
        for (const s of typeChecker(sub, isRawHtml)) {
            yield s
        }
        lit = (isRawHtml = lit.endsWith("$")) ? lit.slice(0, -1) : lit
        if (lit) yield lit
    }
}

export default html

