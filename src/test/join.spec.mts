import { assert } from "chai";
import { join } from "../lib/index.mjs";

interface TestItem {
  readonly name?: string;
  readonly base: string;
  readonly paths: readonly (string | readonly string[])[];
  readonly expected: string;
}

const testItems: TestItem[] = [
  {
    name: "lowercase ascii alpha, 1 simple component",
    base: "file:///foo",
    paths: [["bar"]],
    expected: "file:///foo/bar",
  },
  {
    name: "lowercase ascii alpha, 2 simple components",
    base: "file:///foo",
    paths: [["bar", "baz"]],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "lowercase ascii alpha, empty components list",
    base: "file:///foo",
    paths: [],
    expected: "file:///foo",
  },
  {
    name: "lowercase ascii alpha, 1 empty string component",
    base: "file:///foo",
    paths: [[""]],
    expected: "file:///foo/",
  },
  {
    name: "lowercase ascii alpha, 2 empty string components",
    base: "file:///foo",
    paths: [["", ""]],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 1 simple component",
    base: "file:///foo/",
    paths: [["bar"]],
    expected: "file:///foo/bar",
  },
  {
    name: "trailing separator, 2 simple components",
    base: "file:///foo/",
    paths: [["bar", "baz"]],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "trailing separator, empty components list",
    base: "file:///foo/",
    paths: [],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 1 empty string component",
    base: "file:///foo/",
    paths: [[""]],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 2 empty string components",
    base: "file:///foo/",
    paths: [["", ""]],
    expected: "file:///foo/",
  },
  {
    name: "root, 1 simple component",
    base: "file:///",
    paths: [["bar"]],
    expected: "file:///bar",
  },
  {
    name: "root, 2 simple components",
    base: "file:///",
    paths: [["bar", "baz"]],
    expected: "file:///bar/baz",
  },
  {
    name: "root, empty components list",
    base: "file:///",
    paths: [],
    expected: "file:///",
  },
  {
    name: "root, 1 empty string component",
    base: "file:///",
    paths: [[""]],
    expected: "file:///",
  },
  {
    name: "root, 2 empty string components",
    base: "file:///",
    paths: [["", ""]],
    expected: "file:///",
  },
  {
    name: "Escape percent: only in base",
    base: "file:///a%25b",
    paths: [["cd"]],
    expected: "file:///a%25b/cd",
  },
  {
    name: "Escape percent: only in components",
    base: "file:///ab",
    paths: [["c%d"]],
    expected: "file:///ab/c%25d",
  },
  {
    name: "Escape percent: in base and components",
    base: "file:///a%25b",
    paths: [["c%d"]],
    expected: "file:///a%25b/c%25d",
  },
  {
    name: "Escape tab: only in base",
    base: "file:///a%09b",
    paths: [["cd"]],
    expected: "file:///a%09b/cd",
  },
  {
    name: "Escape tab: only in components",
    base: "file:///ab",
    paths: [["c\td"]],
    expected: "file:///ab/c%09d",
  },
  {
    name: "Escape tab: in base and components",
    base: "file:///a%09b",
    paths: [["c\td"]],
    expected: "file:///a%09b/c%09d",
  },
  {
    name: "append 1 simple uriPath",
    base: "file:///foo",
    paths: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "append 2 simple uriPaths",
    base: "file:///foo",
    paths: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "append a uriPath with 2 segments",
    base: "file:///foo",
    paths: ["bar/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    paths: ["bar//baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    paths: ["bar///baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "append nothing",
    base: "file:///foo",
    paths: [],
    expected: "file:///foo",
  },
  {
    name: "append an empty uriPath",
    base: "file:///foo",
    paths: [""],
    expected: "file:///foo",
  },
  {
    name: "append 2 empty uriPaths",
    base: "file:///foo",
    paths: ["", ""],
    expected: "file:///foo",
  },
  {
    name: "append a slash uriPath",
    base: "file:///foo",
    paths: ["/"],
    expected: "file:///foo/",
  },
  {
    name: "append a slash uriPath twice",
    base: "file:///foo",
    paths: ["/", "/"],
    expected: "file:///foo/",
  },
  {
    name: "append a double-slash uriPath",
    base: "file:///foo",
    paths: ["//"],
    expected: "file:///foo/",
  },
  {
    name: "append a simple uriPath to a base with a trailing slash",
    base: "file:///foo/",
    paths: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "append 2 simple uriPaths to a base with a trailing slash",
    base: "file:///foo/",
    paths: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar/", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar/", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar//", "/baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar//", "//baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo/",
    paths: ["bar/", "/baz/"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    paths: ["bar/", "/baz/"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    paths: ["bar//", "baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    paths: ["bar//", "", "baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    paths: ["bar//", "", "/baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo//",
    paths: ["bar//", "/", "/baz//"],
    expected: "file:///foo/bar/baz/",
  },
  {
    base: "file:///foo",
    paths: ["bar", "/", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    base: "file:///foo",
    paths: ["/"],
    expected: "file:///foo/",
  },
  {
    base: "file:///foo/",
    paths: ["/"],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, empty uriPaths list",
    base: "file:///foo/",
    paths: [],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 1 empty string uriPath",
    base: "file:///foo/",
    paths: [""],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 2 empty string uriPaths",
    base: "file:///foo/",
    paths: ["", ""],
    expected: "file:///foo/",
  },
  {
    name: "root, 1 simple uriPath",
    base: "file:///",
    paths: ["bar"],
    expected: "file:///bar",
  },
  {
    name: "root, 2 simple uriPaths",
    base: "file:///",
    paths: ["bar", "baz"],
    expected: "file:///bar/baz",
  },
  {
    name: "root, empty uriPaths list",
    base: "file:///",
    paths: [],
    expected: "file:///",
  },
  {
    name: "root, 1 empty string uriPath",
    base: "file:///",
    paths: [""],
    expected: "file:///",
  },
  {
    name: "root, 2 empty string uriPaths",
    base: "file:///",
    paths: ["", ""],
    expected: "file:///",
  },
  {
    name: "Escape percent: only in base",
    base: "file:///a%25b",
    paths: ["cd"],
    expected: "file:///a%25b/cd",
  },
  {
    name: "Escape percent: only in uriPaths",
    base: "file:///ab",
    paths: ["c%25d"],
    expected: "file:///ab/c%25d",
  },
  {
    name: "Escape percent: in base and uriPaths",
    base: "file:///a%25b",
    paths: ["c%25d"],
    expected: "file:///a%25b/c%25d",
  },
  {
    name: "Escape tab: only in base",
    base: "file:///a%09b",
    paths: ["cd"],
    expected: "file:///a%09b/cd",
  },
  {
    name: "Escape tab: only in uriPaths",
    base: "file:///ab",
    paths: ["c%09d"],
    expected: "file:///ab/c%09d",
  },
  {
    name: "Escape tab: in base and uriPaths",
    base: "file:///a%09b",
    paths: ["c%09d"],
    expected: "file:///a%09b/c%09d",
  },
];

describe("join", function() {
  for (const { name, base, paths, expected } of testItems) {
    const pathsStr: string = `...${JSON.stringify(paths)}`;
    {
      const inputString: string = `(${JSON.stringify(base)}, ${pathsStr})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: URL = join(base, ...paths);
        assert.strictEqual(actual.toString(), expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(base)}), ${pathsStr})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: URL = join(new URL(base), ...paths);
        assert.strictEqual(actual.toString(), expected);
      });
    }
  }
});
