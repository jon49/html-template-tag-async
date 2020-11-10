// Inspired by source: https://github.com/AntonioVdlC/html-template-tag
;(function() {
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

const catchError = x => x.catch("!!!!Error!!!!")

class Runner {
   constructor(generator) {
      this.g = generator
   }
   async start(callback) {
      var val, e
      while ((val = this.g.next()) && !val.done) {
         var v = val.value
         var e = void 0
         if (v instanceof Promise) {
            v = await v
         } else if (v?.e instanceof Promise) {
            e = await v.e
         }
         if (!e && v?.e) e = v.e
         if (v?.start || (e?.start && (v = e))) {
            await catchError(v.start(callback))
            continue
         }
         if (e) {
            callback(htmlEscape(e))
         } else callback(v)
      }
   }
}

window.html = (literals, ...subs) => new Runner(htmlGenerator(literals, ...subs))

}());
