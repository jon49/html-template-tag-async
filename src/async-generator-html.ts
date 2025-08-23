// import escape from 'npm:html-es6cape@2.0.2' // This isn't working for some reason.
import escape from './libs/html-es6cape.ts'

const htmlPrototype = Object.getPrototypeOf(html)

const GeneratorFunction = function*(){}.constructor

export function isHtml(value: unknown): value is (ReturnType<typeof html>) {
    return value?.constructor === htmlPrototype
}

async function* typeChecker(sub: unknown, isRawHtml: boolean): AsyncGenerator<string, void, unknown> {
    const type = typeof sub,
          isPromise = sub instanceof Promise
    if (Array.isArray(sub) || (sub instanceof GeneratorFunction && (sub = (sub as Function)()))) {
        for await (const s of sub as any[]) {
            for await (const x of typeChecker(s, isRawHtml)) {
                yield x
            }
        }
    } else if ((isPromise && (sub = await sub)) || (sub instanceof Function && (sub = sub()))) {
        for await (const s of typeChecker(sub, isRawHtml)) {
            yield s
        }
    } else if (isHtml(sub)) {
        for await (const s of sub) {
            yield s
        }
    } else {
        // I don't know how to handle it so just turn it into a string.
        // @ts-ignore sub is unknown and that is correct.
        yield isRawHtml ? sub.toString() : escape(sub.toString())
    }
}

async function* resolveToString(current: unknown, isRawHtml: boolean): AsyncGenerator<string, void, unknown> {
  while (true) {
    // Skip null/undefined/false values
    if (current == null || current === false) {
      break;
    }
    
    // If it's already a string, yield it and we're done
    if (typeof current === "string") {
      yield isRawHtml ? current : escape(current);
      break;
    }
    
    // If it's a number, convert and yield
    if (typeof current === "number") {
      yield "" + current;
      break;
    }
    
    // For all other types, use typeChecker to get the next level
    // Process each result in order
    for await (const result of typeChecker(current, isRawHtml)) {
      for await (const resolved of resolveToString(result, true)) {
        yield resolved;
      }
    }
    break; // Exit after processing all results from typeChecker
  }
}

async function* html(literals: TemplateStringsArray, ...subs: unknown[]) {
  const lits = literals.raw, length = lits.length;
  
  for (let i = 0; i < length; i++) {
    let lit = lits[i];
    
    // First yield the literal part
    const isRawHtml = lit.endsWith("$");
    lit = isRawHtml ? lit.slice(0, -1) : lit;
    if (lit)
      yield lit;
    
    // Then process the substitution that follows this literal
    const sub = subs[i];
    if (sub !== undefined) {
      // The isRawHtml flag applies to THIS substitution (determined by the literal that precedes it)
      for await (const resolved of resolveToString(sub, isRawHtml)) {
        yield resolved;
      }
    }
  }
}

export default html
