export declare function isHtml(value: unknown): value is (ReturnType<typeof html>);
declare function html(literals: TemplateStringsArray, ...subs: unknown[]): Generator<any, void, unknown>;
export default html;
