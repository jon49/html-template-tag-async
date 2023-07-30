import html from "../src/async-generator-html.ts";
import { assertEquals, assert } from "https://deno.land/std@0.186.0/testing/asserts.ts"
import {
  describe,
  it,
} from "https://deno.land/std@0.186.0/testing/bdd.ts";

describe("html", () => {
    it("should return a string", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>Hello World</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World</div>")
    })

    it("should be able to handle multiple strings", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${"Hello World"}${""}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World</div>")
    })

    it("should encode html", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>&lt;script&gt;alert(&#39;hello&#39;)&lt;/script&gt;</div>")
    })

    it("should skip encoding if $ is used", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>$${"<script>alert('hello')</script>"}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div><script>alert('hello')</script></div>")
    })

    it("should be able to work with numbers", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${1}—${0}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>1—0</div>")
    })

    it("should be able to work with nil values", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${null}${undefined}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div></div>")
    })

    it("should be able to work with promises", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${Promise.resolve("Hello World<")}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World&lt;</div>")
    })

    it("should be able to work with arrays", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${["Hello", " World<"]}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World&lt;</div>")
    })

    it("should be able to work with nested generators", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${html`<p>${"Hello<"} World</p>`}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div><p>Hello&lt; World</p></div>")
    })

    it("should be able to work with random objects", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${{toString: () => "Hello World"}}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World</div>")
    })

    it("should work with plain functions", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${() => "Hello World<"}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World&lt;</div>")
    })

    it("should work with generators", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${
            function* generatorFunc() {
                yield "Hello"
                yield " World<"
            }}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World&lt;</div>")
    })

    it("should work with async functions", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>${async () => await Promise.resolve("Hello World<")}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div>Hello World&lt;</div>")
    })

    it("should not escape random objects when $ is used", async () => {
        const xs : unknown[] = []
        for await (const s of html`<div>$${{toString: () => "<script>alert('hello')</script>"}}</div>`) {
            xs.push(s)
        }
        assertEquals(xs.join(''), "<div><script>alert('hello')</script></div>")
    })

})

