import chai from "chai";
import url from "url";
import { join } from "../lib";

interface TestItem {
  readonly name?: string;
  readonly base: string;
  readonly components: readonly string[];
  readonly expected: string;
}

const testItems: TestItem[] = [
  {
    name: "lowercase ascii alpha, 1 simple component",
    base: "file:///foo",
    components: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "lowercase ascii alpha, 2 simple components",
    base: "file:///foo",
    components: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "lowercase ascii alpha, empty components list",
    base: "file:///foo",
    components: [],
    expected: "file:///foo",
  },
  {
    name: "lowercase ascii alpha, 1 empty string component",
    base: "file:///foo",
    components: [""],
    expected: "file:///foo/",
  },
  {
    name: "lowercase ascii alpha, 2 empty string components",
    base: "file:///foo",
    components: ["", ""],
    expected: "file:///foo//",
  },
  {
    name: "trailing separator, 1 simple component",
    base: "file:///foo/",
    components: ["bar"],
    expected: "file:///foo/bar",
  },
  {
    name: "trailing separator, 2 simple components",
    base: "file:///foo/",
    components: ["bar", "baz"],
    expected: "file:///foo/bar/baz",
  },
  {
    name: "trailing separator, empty components list",
    base: "file:///foo/",
    components: [],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 1 empty string component",
    base: "file:///foo/",
    components: [""],
    expected: "file:///foo/",
  },
  {
    name: "trailing separator, 2 empty string components",
    base: "file:///foo/",
    components: ["", ""],
    expected: "file:///foo//",
  },
  {
    name: "root, 1 simple component",
    base: "file:///",
    components: ["bar"],
    expected: "file:///bar",
  },
  {
    name: "root, 2 simple components",
    base: "file:///",
    components: ["bar", "baz"],
    expected: "file:///bar/baz",
  },
  {
    name: "root, empty components list",
    base: "file:///",
    components: [],
    expected: "file:///",
  },
  {
    name: "root, 1 empty string component",
    base: "file:///",
    components: [""],
    expected: "file:///",
  },
  {
    name: "root, 2 empty string components",
    base: "file:///",
    components: ["", ""],
    expected: "file:///",
  },
  {
    name: "Escape percent: only in base",
    base: "file:///a%25b",
    components: ["cd"],
    expected: "file:///a%25b/cd",
  },
  {
    name: "Escape percent: only in components",
    base: "file:///ab",
    components: ["c%d"],
    expected: "file:///ab/c%25d",
  },
  {
    name: "Escape percent: in base and components",
    base: "file:///a%25b",
    components: ["c%d"],
    expected: "file:///a%25b/c%25d",
  },
  {
    name: "Escape tab: only in base",
    base: "file:///a%09b",
    components: ["cd"],
    expected: "file:///a%09b/cd",
  },
  {
    name: "Escape tab: only in components",
    base: "file:///ab",
    components: ["c\td"],
    expected: "file:///ab/c%09d",
  },
  {
    name: "Escape tab: in base and components",
    base: "file:///a%09b",
    components: ["c\td"],
    expected: "file:///a%09b/c%09d",
  },
];

describe("join", function () {
  for (const {name, base, components, expected} of testItems) {
    {
      const inputString: string = `(${JSON.stringify(base)}, ${JSON.stringify(components)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = join(base, components);
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(base)}), ${JSON.stringify(components)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = join(new url.URL(base), components);
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
  }
});
