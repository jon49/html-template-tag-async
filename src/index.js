const chars = {
	"&": "&amp;",
	">": "&gt;",
	"<": "&lt;",
	'"': "&quot;",
	"'": "&#39;",
	"`": "&#96;"
};

// Dynamically create a RegExp from the `chars` object
const re = new RegExp(Object.keys(chars).join("|"), "g");

// Return the escaped string
const htmlEscape = (str = "") => String(str).replace(re, match => chars[match]);

function* htmlGenerator(literals, ...subs) {
   var length = literals.raw.length,
      s = "",
      escape = true
   for (var i = 0; i < length; i++) {
      let lit = literals.raw[i]
      let sub = subs[i - 1]
      if (sub) {
         if (Array.isArray(sub)) { for (s of sub) if (s) yield s }
         else yield escape ? sub : { e: sub }
      }
      lit = (escape = lit.endsWith("$")) ? lit.slice(0, -1) : lit
      if (lit) yield lit
   }
}

export default callback =>
    async function runHtml(literals, ...subs) {
        var html = htmlGenerator(literals, ...subs)
        var val = html.next()
        var e
        while (!val.done) {
            if (e = val.value.e) {
                if (e instanceof Promise) {
                    e = await e
                }
                callback(htmlEscape(e))
            } else if (val.value instanceof Promise) {
                callback(await val.value)
            } else {
                callback(val.value)
            }
            val = html.next()
        }
    }
