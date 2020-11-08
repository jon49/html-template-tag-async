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

class Runner {

   constructor(generator, callback) {
      this.g = generator
      this.c = callback
   }

   async start() {
      var val, e
      while ((val = this.g.next()) && !val.done) {
         var v = val.value
         if (v instanceof Runner || (v.e instanceof Runner && (v = v.e))) {
            await v.start()
            continue
         }
         if (e = v.e) {
            if (e instanceof Promise) {
               e = await e
            }
            this.c(htmlEscape(e))
         } else if (v instanceof Promise) {
            this.c(await v)
         } else {
            this.c(v)
         }
      }
   }
}

export default 
   callback =>
   (literals, ...subs) => {
      var generator = htmlGenerator(literals, ...subs)
      return new Runner(generator, callback)
   }
