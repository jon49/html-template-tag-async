const chars = {
  "&": "&amp;",
  ">": "&gt;",
  "<": "&lt;",
  '"': "&quot;",
  "'": "&#39;",
  "`": "&#96;",
}

// Dynamically create a RegExp from the `chars` object
const re = new RegExp(Object.keys(chars).join("|"), "g");

// Return the escaped string
function escape(str = "") {
    // @ts-ignore
    return String(str).replace(re, (match) => chars[match]);
}

let htmlPrototype : any

function* html(literals: TemplateStringsArray, ...subs: (Generator|string|null|undefined)[]|(Generator|string|null|undefined)[][]) {
    let lits = literals.raw,
      isRawHtml : boolean
      length = lits.length
    for (var i = 0; i < length; i++) {
        let lit = lits[i]
        let sub = subs[i - 1]
        if (sub) {
            if (Array.isArray(sub)) {
                for (let s of sub) {
                    if (s) {
                        // @ts-ignore
                        if (typeof s === "object" && s.constructor === htmlPrototype) {
                            for (let ss of s) {
                                yield ss
                            }
                        } else {
                            yield s
                        }
                    }
                }
            } else {
                // @ts-ignore
                yield isRawHtml ? sub : escape(sub)
            }
        }
        lit = (isRawHtml = lit.endsWith("$")) ? lit.slice(0, -1) : lit
        if (lit) yield lit
    }
}

htmlPrototype = Object.getPrototypeOf(html)

export default html
