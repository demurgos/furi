import chai from "chai";
import url from "url";
import { parent } from "../lib";

interface TestItem {
  readonly name?: string;
  readonly input: string;
  readonly expected: string;
}

const testItems: TestItem[] = [
  {
    name: "root",
    input: "file:///",
    expected: "file:///",
  },
  {
    name: "root, 1 trailing separator",
    input: "file:////",
    expected: "file:///",
  },
  {
    name: "root, 2 trailing separators",
    input: "file://///",
    expected: "file:///",
  },
  {
    name: "root file",
    input: "file:///foo",
    expected: "file:///",
  },
  {
    name: "root file, 1 trailing separator",
    input: "file:///foo/",
    expected: "file:///",
  },
  {
    name: "root file, 2 trailing separators",
    input: "file:///foo//",
    expected: "file:///foo",
  },
  {
    name: "file at depth 1, 1 trailing separator",
    input: "file:///foo/bar/",
    expected: "file:///foo",
  },
  {
    name: "file at depth 1, 2 trailing separators",
    input: "file:///foo/bar//",
    expected: "file:///foo/bar",
  },
  {
    name: "file at depth 2",
    input: "file:///foo/bar/baz",
    expected: "file:///foo/bar",
  },
  {
    name: "file at depth 2, 1 trailing separator",
    input: "file:///foo/bar/baz/",
    expected: "file:///foo/bar",
  },
  {
    name: "file at depth 2, 2 trailing separators",
    input: "file:///foo/bar/baz//",
    expected: "file:///foo/bar/baz",
  },
  {
    name: "escaped percent",
    input: "file:///foo%25bar/baz",
    expected: "file:///foo%25bar",
  },
  {
    name: "escaped tab",
    input: "file:///foo%09bar/baz",
    expected: "file:///foo%09bar",
  },
];

describe("parent", function () {
  for (const {name, input, expected} of testItems) {
    {
      const inputString: string = `(${JSON.stringify(input)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = parent(input);
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(input)})})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: url.URL = parent(new url.URL(input));
        chai.assert.strictEqual(actual.toString(), expected);
      });
    }
  }
});
