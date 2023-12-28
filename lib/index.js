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
  if (sub == null || sub === false) {
  } else if (type === "string") {
    yield isRawHtml ? sub : html_es6cape_default(sub);
  } else if (type === "number") {
    yield "" + sub;
  } else if (Array.isArray(sub) || sub instanceof GeneratorFunction && (sub = sub())) {
    for await (const s of sub) {
      for await (const x of typeChecker(s, isRawHtml)) {
        yield x;
      }
    }
  } else if (isPromise || sub instanceof Function) {
    sub = isPromise ? await sub : sub();
    for await (const s of typeChecker(sub, isRawHtml)) {
      yield s;
    }
  } else if (isHtml(sub)) {
    for await (const s of sub) {
      yield s;
    }
  } else {
    yield isRawHtml ? sub.toString() : html_es6cape_default(sub.toString());
  }
}
async function* html(literals, ...subs) {
  const lits = literals.raw, length = lits.length;
  let isRawHtml = true;
  for (let i = 0; i < length; i++) {
    let lit = lits[i];
    const sub = subs[i - 1];
    for await (const s of typeChecker(sub, isRawHtml)) {
      yield s;
    }
    lit = (isRawHtml = lit.endsWith("$")) ? lit.slice(0, -1) : lit;
    if (lit)
      yield lit;
  }
}
var async_generator_html_default = html;
export {
  async_generator_html_default as default,
  isHtml
};
