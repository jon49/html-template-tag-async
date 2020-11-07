Originally based off of <https://github.com/AntonioVdlC/html-template-tag> but adding async.

E.g.,

```js
const html = makeHtml(x => console.log(x))

let time = (time, msg) => new Promise((resolve, reject) => {
  setTimeout( function() {
    resolve(msg)
  }, time) 
})

;(function() {
   const yep = "Hello!"
   const ok = "hhmmm"
   html`${yep}${time(1e3, "<h1>Yes!</h1>")}$${time(2e3, "<h1>No!</h1>")}Alrighty!${[...Array(5).keys()].map(x => time((x+3)*1000, ""+x))}${`<h2>${ok}</h2>`}...${time(10e3, "fin!")}`
   .catch(x => console.log(x))
}());
```
