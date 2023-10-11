export declare function isHtml(value: unknown): value is (ReturnType<typeof html>);
declare function html(literals: TemplateStringsArray, ...subs: unknown[]): AsyncGenerator<any, void, unknown>;
export default html;
