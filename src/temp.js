// This code fixes the deeply nested generators/promises issue. Make sure the
// new code integrated into the origianl works before deleted this.
// src/libs/chars.ts
var chars = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;"
};
var chars_default = chars;

// src/libs/html-es6cape.ts
var re = new RegExp(Object.keys(chars_default).join("|"), "g");
function escape(str = "") {
  return String(str).replace(re, (match) => chars_default[match]);
}
var html_es6cape_default = escape;

// src/async-generator-html.ts
var htmlPrototype = Object.getPrototypeOf(html);
var GeneratorFunction = function* () {
}.constructor;
function isHtml(value) {
  return value?.constructor === htmlPrototype;
}
async function* typeChecker(sub, isRawHtml) {
  const type = typeof sub, isPromise = sub instanceof Promise;
  if (Array.isArray(sub) || sub instanceof GeneratorFunction && (sub = sub())) {
    for await (const s of sub) {
      yield s; // Just yield the raw value, let html function handle type resolution
    }
  } else if (isPromise || sub instanceof Function) {
    sub = isPromise ? await sub : sub();
    yield sub; // Just yield the resolved value, let html function handle type resolution
  } else if (isHtml(sub)) {
    for await (const s of sub) {
      yield s; // Just yield the raw value, let html function handle type resolution
    }
  } else {
    yield isRawHtml ? sub.toString() : html_es6cape_default(sub.toString());
  }
}

async function* resolveToString(value, isRawHtml) {
  // Keep processing until we get a string
  let current = value;
  
  while (true) {
    // Skip null/undefined/false values
    if (current == null || current === false) {
      break;
    }
    
    // If it's already a string, yield it and we're done
    if (typeof current === "string") {
      yield isRawHtml ? current : html_es6cape_default(current);
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

async function* html(literals, ...subs) {
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
var async_generator_html_default = html;
export {
  async_generator_html_default as default,
  isHtml
};