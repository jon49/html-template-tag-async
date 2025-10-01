import html, { isHtml } from "../src/index.ts";
import o from "ospec"

o.spec("Async Generator HTML", () => {
    o("should return a string", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>Hello World</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World</div>")
    })

    o("should be able to handle array of null sub", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${[undefined, null, "OK"]}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>OK</div>")
    })

    o("should be able to handle multiple strings", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${"Hello World"}${""}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World</div>")
    })

    o("should encode html", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>&lt;script&gt;alert(&#39;hello&#39;)&lt;/script&gt;</div>")
    })

    o("should skip encoding if $ is used", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>$${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><script>alert('hello')</script></div>")
    })

    o("should be able to work with numbers", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${1}—${0}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>1—0</div>")
    })

    o("should be able to work with nil values", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${null}${undefined}</div>`) {
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

    o("should be able to work with promises", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${Promise.resolve("Hello World<")}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should be able to work with arrays", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${["Hello", " World<"]}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should be able to work with nested generators", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${html`<p>${"Hello<"} World</p>`}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><p>Hello&lt; World</p></div>")
    })

    o("should be able to work with random objects", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${{toString: () => "Hello World"}}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World</div>")
    })

    o("should work with plain functions", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${() => "Hello World<"}</div>`) {
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

    o("should work with async functions", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${async () => await Promise.resolve("Hello World<")}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div>Hello World&lt;</div>")
    })

    o("should not escape random objects when $ is used", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>$${{toString: () => "<script>alert('hello')</script>"}}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div><script>alert('hello')</script></div>")
    })

    o("should tell if it is its own type", () => {
        o(isHtml(html``)).equals(true)
    })

    o("should tell if it is not its own type", () => {
        o(!isHtml(generatorFunc())).equals(true)
    })

    o("should be able to handle function which returns nil value", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${() => null}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div></div>")
    })

    o("should be able to handle function which returns 'false' value", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${() => false}</div>`) {
            xs.push(s)
        }
        o(xs.join('')).equals("<div></div>")
    })

    o("should be able to handle deeply nested templates", async () => {
        const xs : unknown[] = []
        for await (const s of deeplyNested()) {
            xs.push(s)
        }
        o(xs.join('')).equals(`
<div>
    <div><p>It worked!</p></div>
</div>
    `)
    })

})

function deeplyNested() {
    return html`
<div>
    ${() =>
        async function* aGenerator() {
            let val = await Promise.resolve("It worked!")
            yield html`<div>`
            yield Promise.resolve(html`<p>${() => html`${() => Promise.resolve(val)}`}</p>`)
            yield html`</div>`
        }
    }
</div>
    `
}

function* generatorFunc() {
    yield "Hello"
    yield " World<"
}

