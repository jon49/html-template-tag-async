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

// src/generator-html.ts
var htmlPrototype = Object.getPrototypeOf(html);
function* typeChecker(sub, isRawHtml) {
  const type = typeof sub;
  if (sub == null) {
  } else if (type === "string") {
    yield isRawHtml ? sub : html_es6cape_default(sub);
  } else if (type === "number") {
    yield "" + sub;
  } else if (sub instanceof Function) {
    for (const s of typeChecker(sub(), isRawHtml)) {
      yield s;
    }
  } else if (Array.isArray(sub)) {
    for (const s of sub) {
      for (const x of typeChecker(s, true)) {
        yield x;
      }
    }
  } else if (sub.constructor === htmlPrototype) {
    for (const s of sub) {
      yield s;
    }
  } else {
    yield isRawHtml ? sub.toString() : html_es6cape_default(sub.toString());
  }
}
function* html(literals, ...subs) {
  const lits = literals.raw, length = lits.length;
  let isRawHtml = true;
  for (let i = 0; i < length; i++) {
    let lit = lits[i];
    const sub = subs[i - 1];
    for (const s of typeChecker(sub, isRawHtml)) {
      yield s;
    }
    lit = (isRawHtml = lit.endsWith("$")) ? lit.slice(0, -1) : lit;
    if (lit)
      yield lit;
  }
}
var generator_html_default = html;
export {
  generator_html_default as default
};