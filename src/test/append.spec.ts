import chai from "chai";
import url from "url";
import { append } from "../lib";

interface TestItem {
  readonly name?: string;
  readonly base: string;
  readonly uriPaths: readonly string[];
  readonly expected: string;
}

const testItems: TestItem[] = [
  {
    name: "append 1 simple uriPath",
    base: "file:///foo",
    uriPaths: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "append 2 simple uriPaths",
    base: "file:///foo",
    uriPaths: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "append a uriPath with 2 segments",
    base: "file:///foo",
    uriPaths: ["bar/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    uriPaths: ["bar//baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    uriPaths: ["bar///baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "append nothing",
    base: "file:///foo",
    uriPaths: [],
    expected: "file:///foo",
  },
  {
    name: "append an empty uriPath",
    base: "file:///foo",
    uriPaths: [""],
    expected: "file:///foo",
  },
  {
    name: "append 2 empty uriPaths",
    base: "file:///foo",
    uriPaths: ["", ""],
    expected: "file:///foo",
  },
  {
    name: "append a slash uriPath",
    base: "file:///foo",
    uriPaths: ["/"],
    expected: "file:///foo/",
  },
  {
    name: "append a slash uriPath twice",
    base: "file:///foo",
    uriPaths: ["/", "/"],
    expected: "file:///foo/",
  },
  {
    name: "append a double-slash uriPath",
    base: "file:///foo",
    uriPaths: ["//"],
    expected: "file:///foo/",
  },
  {
    name: "append a simple uriPath to a base with a trailing slash",
    base: "file:///foo/",
    uriPaths: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "append 2 simple uriPaths to a base with a trailing slash",
    base: "file:///foo/",
    uriPaths: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar/", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar/", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar//", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar//", "//baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    uriPaths: ["bar/", "/baz/"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    uriPaths: ["bar/", "/baz/"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    uriPaths: ["bar//", "baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    uriPaths: ["bar//", "", "baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    uriPaths: ["bar//", "", "/baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    uriPaths: ["bar//", "/", "/baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo",
    uriPaths: ["bar", "/", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    uriPaths: ["/"],
    expected: "file:///foo/",
  },
  {
    base: "file:///foo/",
    uriPaths: ["/"],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, empty uriPaths list",
    base: "file:///foo/",
    uriPaths: [],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 1 empty string uriPath",
    base: "file:///foo/",
    uriPaths: [""],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 2 empty string uriPaths",
    base: "file:///foo/",
    uriPaths: ["", ""],
    expected: "file:///foo/",
  },
  {
    name: "root, 1 simple uriPath",
    base: "file:///",
    uriPaths: ["bar"],
    expected: "file:///bar",
  },
  {
    name: "root, 2 simple uriPaths",
    base: "file:///",
    uriPaths: ["bar", "baz"],
    expected: "file:///bar/baz",
  },
  {
    name: "root, empty uriPaths list",
    base: "file:///",
    uriPaths: [],
    expected: "file:///",
  },
  {
    name: "root, 1 empty string uriPath",
    base: "file:///",
    uriPaths: [""],
    expected: "file:///",
  },
  {
    name: "root, 2 empty string uriPaths",
    base: "file:///",
    uriPaths: ["", ""],
    expected: "file:///",
  },
  {
    name: "Escape percent: only in base",
    base: "file:///a%25b",
    uriPaths: ["cd"],
    expected: "file:///a%25b/cd",
  },
  {
    name: "Escape percent: only in uriPaths",
    base: "file:///ab",
    uriPaths: ["c%25d"],
    expected: "file:///ab/c%25d",
  },
  {
    name: "Escape percent: in base and uriPaths",
    base: "file:///a%25b",
    uriPaths: ["c%25d"],
    expected: "file:///a%25b/c%25d",
  },
  {
    name: "Escape tab: only in base",
    base: "file:///a%09b",
    uriPaths: ["cd"],
    expected: "file:///a%09b/cd",
  },
  {
    name: "Escape tab: only in uriPaths",
    base: "file:///ab",
    uriPaths: ["c%09d"],
    expected: "file:///ab/c%09d",
  },
  {
    name: "Escape tab: in base and uriPaths",
    base: "file:///a%09b",
    uriPaths: ["c%09d"],
    expected: "file:///a%09b/c%09d",
  },
];

describe("append", function () {
  for (const {name, base, uriPaths, expected} of testItems) {
    {
      const inputString: string = `(${JSON.stringify(base)}, ...${JSON.stringify(uriPaths)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = append(base, ...uriPaths);
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(base)}), ...${JSON.stringify(uriPaths)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = append(new url.URL(base), ...uriPaths);
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
  }
});
