import * as assert from "node:assert/strict";
import {describe, test} from "node:test";
import { relative } from "../lib/index.mjs";

interface TestItem {
  readonly name?: string;
  readonly from: string;
  readonly to: string;
  readonly expected: string;
}

const testItems: TestItem[] = [
  {
    from: "file:///var/lib",
    to: "file:///var",
    expected: "..",
  },
  {
    from: "file:///var/lib",
    to: "file:///bin",
    expected: "../../bin",
  },
  {
    from: "file:///var/lib",
    to: "file:///var/lib",
    expected: "",
  },
  {
    from: "file:///var/lib",
    to: "file:///var/apache",
    expected: "../apache",
  },
  {
    from: "file:///var",
    to: "file:///var/lib",
    expected: "./lib",
  },
  {
    from: "file:///var/",
    to: "file:///var/lib",
    expected: "./lib",
  },
  {
    from: "file:///",
    to: "file:///var/lib",
    expected: "./var/lib",
  },
  {
    from: "file:///foo/test",
    to: "file:///foo/test/bar/package.json",
    expected: "./bar/package.json",
  },
  {
    from: "file:///Users/a/web/b/test/mails",
    to: "file:///Users/a/web/b",
    expected: "../..",
  },
  {
    from: "file:///Users/a/web/b/test/mails",
    to: "file:///Users/a/web/b/",
    expected: "../../",
  },
  {
    from: "file:///foo/bar/baz-quux",
    to: "file:///foo/bar/baz",
    expected: "../baz",
  },
  {
    from: "file:///foo/bar/baz",
    to: "file:///foo/bar/baz-quux",
    expected: "../baz-quux",
  },
  {
    from: "file:///baz-quux",
    to: "file:///baz",
    expected: "../baz",
  },
  {
    from: "file:///baz",
    to: "file:///baz-quux",
    expected: "../baz-quux",
  },
  {
    from: "file:///page1/page2/foo",
    to: "file:///",
    expected: "../../..",
  },
  {
    from: "file://localhost/var/lib",
    to: "file:///var/lib",
    expected: "",
  },
  {
    from: "file:///var/lib",
    to: "file://localhost/var/lib",
    expected: "",
  },
  {
    from: "file://localhost/var/lib",
    to: "file://localhost/var/lib",
    expected: "",
  },
  {
    from: "file://drive1/var/lib",
    to: "file://drive2/var/lib",
    expected: "file://drive2/var/lib",
  },
  {
    from: "file://localhost/var/lib",
    to: "file://drive/var/lib",
    expected: "file://drive/var/lib",
  },
  {
    from: "file://drive/var/lib",
    to: "file://localhost/var/lib",
    expected: "file:///var/lib",
  },
  {
    from: "file:///var/lib",
    to: "file://drive/var/lib",
    expected: "file://drive/var/lib",
  },
  {
    from: "file://drive/var/lib",
    to: "file:///var/lib",
    expected: "file:///var/lib",
  },
];

describe("relative", function() {
  for (const { name, from, to, expected } of testItems) {
    {
      const inputString: string = `(${JSON.stringify(from)}, ${JSON.stringify(to)})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      test(title, () => {
        const actual: string = relative(from, to);
        assert.strictEqual(actual, expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(from)}), new url.URL(${JSON.stringify(to)}))`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      test(title, () => {
        const actual: string = relative(new URL(from), new URL(to));
        assert.strictEqual(actual, expected);
      });
    }
  }
});
