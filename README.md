# html-template-tag-stream

ES6 Tagged Template for compiling HTML template streams.

## Installation

This package is distributed via npm:

```
npm install html-template-tag
```

## Usage

### String Interpolation

At its core, this module just performs simple ES6 string interpolation.

```javascript
import html from "html-template-tag-stream"

var name = `Jon`
var string = ""
for await (const s of html`Hello, ${name}!`) {
    string += s
}
// "Hello, Jon!"
```

Nevertheless, it escapes HTML special characters without refraining its use in
loops!

```javascript
import html from "html-template-tag-stream"

var names = ["Jon", "George", "/><script>alert('xss')</script>"];
var string = ""
var template = html`
	<ul>
		${names.map((name) => html`
			<li>Hello, ${name}!</li>
		`)}
	</ul>
`
for await (const s of template) {
    string += s
}
// "<ul><li>Hello, Jon!</li><li>Hello, George!</li><li>Hello, /&gt;&lt;script&gt;alert(&#39;xss&#39;)&lt;/script&gt;!</li></ul>"
```

### Skip autoscaping

You can use double dollar signs in interpolation to mark the value as safe
(which means that this variable will not be escaped).

```javascript
var name = `<strong>Jon</strong>`;
var string = ""
for await (var s of html`Hello, $${name}!`) {
    string += s
}
// "Hello, <strong>Antonio</strong>!"
```

### HTML Template Pre-Compiling

This small module can also be used to pre-compile HTML templates:

```javascript
import html from "html-template-tag-stream"

var data = {
	count: 2,
	names: ["Jon", "George"]
}

var template = ({names}) => html`
	<ul>
		${names.map((name) => html`
			<li>Hello, ${name}!</li>
		`)}
	</ul>
`

var string = ""

for await (var s of template(data)) {
    string += s
}
/* 
	"
	<ul>
		<li>Hello, Antonio!</li>
		<li>Hello, Megan!</li>
	</ul>
	"
*/
```

> NB: The formatting of the string literal is kept.

That's not all the things you can do with this. Here's a more complex example
for a more realistic case beyond what the original library used. You can use
this to stream HTML from a server or from a service worker.

```javascript
const encoder = new TextEncoder()
function streamResponse(generator) {
    let { body, headers } =
        "body" in generator
            ? generator
        : { body: generator, headers: {} }
    const stream = new ReadableStream({
        async start(controller : ReadableStreamDefaultController<any>) {
            for await (let s of body) {
                controller.enqueue(encoder.encode(s))
            }
            controller.close()
        }
    })

    return new Response(
        stream, {
            headers: {
                "content-type": "text/html; charset=utf-8",
                ...headers
            }
        })
}
```

[See the tests for all the types you can pass in!](./tests/async-generator-html.test.ts)

## License

ISC

## Thanks

Originally based off of <https://github.com/AntonioVdlC/html-template-tag>.
Which was in turn inspired by:

> The code for this module has been heavily inspired on [Axel Rauschmayer's post
> on HTML templating with ES6 template
> strings](http://www.2ality.com/2015/01/template-strings-html.html) and [Stefan
> Bieschewski's
> comment](http://www.2ality.com/2015/01/template-strings-html.html#comment-2078932192).
