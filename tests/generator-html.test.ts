import html, { isHtml } from "../src/generator-html.ts";
import o from "ospec"

o.spec("Generator HTML", () => {
    o("should return a string", () => {
        const xs : unknown[] = []
        for (const s of html`<div>Hello World</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World</div>")
    })

    o("should be able to handle multiple strings", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${"Hello World"}${""}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World</div>")
    })

    o("should encode html", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>&lt;script&gt;alert(&#39;hello&#39;)&lt;/script&gt;</div>")
    })

    o("should skip encoding if $ is used", () => {
        const xs : unknown[] = []
        for (const s of html`<div>$${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><script>alert('hello')</script></div>")
    })

    o("should be able to work with numbers", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${1}—${0}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>1—0</div>")
    })

    o("should be able to work with nil values", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${null}${undefined}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div></div>")
    })

    o("should be able to work with false value", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${false}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div></div>")
    })

    o("should be able to work with arrays", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${["Hello", " World<"]}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should be able to work with nested generators", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${html`<p>${"Hello<"} World</p>`}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><p>Hello&lt; World</p></div>")
    })

    o("should be able to work with random objects", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${{toString: () => "Hello World<"}}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should work with plain functions", () => {
        const xs : unknown[] = []
        for (const s of html`<div>${() => "Hello World<"}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should work with generators", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${
            function* generatorFunc() {
                yield "Hello"
                yield " World<"
            }}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should not escape random objects when $ is used", () => {
        const xs : unknown[] = []
        for (const s of html`<div>$${{toString: () => "<script>alert('hello')</script>"}}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><script>alert('hello')</script></div>")
    })

    o("should tell if it is its own type", () => {
        o(isHtml(html``)).equals(true)
    })
})


