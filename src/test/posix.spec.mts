import * as assert from "node:assert/strict";
import {describe, test} from "node:test";
import { fromPosixPath, Furi, toPosixPath } from "../lib/index.mjs";

interface TestItem {
  name?: string;
  furi: string;
  posixPath: string;
  otherFuris: string[];
}

const testItems: TestItem[] = [
  {
    name: "lowercase ascii alpha",
    furi: "file:///foo",
    posixPath: "/foo",
    otherFuris: ["file://localhost/foo"],
  },
  {
    name: "uppercase ascii alpha",
    furi: "file:///FOO",
    posixPath: "/FOO",
    otherFuris: ["file://localhost/FOO"],
  },
  {
    name: "dir",
    furi: "file:///dir/foo",
    posixPath: "/dir/foo",
    otherFuris: ["file://localhost/dir/foo"],
  },
  {
    name: "trailing separator",
    furi: "file:///dir/",
    posixPath: "/dir/",
    otherFuris: [],
  },
  {
    name: "space",
    furi: "file:///foo%20bar",
    posixPath: "/foo bar",
    otherFuris: [],
  },
  {
    name: "question mark",
    furi: "file:///foo%3Fbar",
    posixPath: "/foo?bar",
    otherFuris: [],
  },
  {
    name: "number sign",
    furi: "file:///foo%23bar",
    posixPath: "/foo#bar",
    otherFuris: [],
  },
  {
    name: "ampersand",
    furi: "file:///foo&bar",
    posixPath: "/foo&bar",
    otherFuris: [],
  },
  {
    name: "equals",
    furi: "file:///foo=bar",
    posixPath: "/foo=bar",
    otherFuris: [],
  },
  {
    name: "colon",
    furi: "file:///foo:bar",
    posixPath: "/foo:bar",
    otherFuris: [],
  },
  {
    name: "semicolon",
    furi: "file:///foo;bar",
    posixPath: "/foo;bar",
    otherFuris: [],
  },
  {
    name: "percent",
    furi: "file:///foo%25bar",
    posixPath: "/foo%bar",
    otherFuris: [],
  },
  {
    name: "backslash",
    furi: "file:///foo%5Cbar",
    posixPath: "/foo\\bar",
    otherFuris: [],
  },
  {
    name: "backspace",
    furi: "file:///foo%08bar",
    posixPath: "/foo\bbar",
    otherFuris: [],
  },
  {
    name: "tab",
    furi: "file:///foo%09bar",
    posixPath: "/foo\tbar",
    otherFuris: [],
  },
  {
    name: "newline",
    furi: "file:///foo%0Abar",
    posixPath: "/foo\nbar",
    otherFuris: [],
  },
  {
    name: "carriage return",
    furi: "file:///foo%0Dbar",
    posixPath: "/foo\rbar",
    otherFuris: [],
  },
  {
    name: "latin1",
    furi: "file:///f%C3%B3%C3%B3b%C3%A0r",
    posixPath: "/fóóbàr",
    otherFuris: [],
  },
  {
    name: "euro sign (BMP code point)",
    furi: "file:///%E2%82%AC",
    posixPath: "/€",
    otherFuris: [],
  },
  {
    name: "rocket emoji (non-BMP code point)",
    furi: "file:///%F0%9F%9A%80",
    posixPath: "/🚀",
    otherFuris: [],
  },
];

describe("toPosixPath", function() {
  for (const item of testItems) {
    const expected: string = item.posixPath;
    const inputs: string[] = [item.furi, ...item.otherFuris];
    for (const input of inputs) {
      const title: string = item.name !== undefined ? `${item.name}: ${input}` : input;
      test(title, () => {
        const actual: string = toPosixPath(input);
        assert.strictEqual(actual, expected);
      });
      test(`${title} (Furi)`, () => {
        const actual: string = new Furi(input).toPosixPath();
        assert.strictEqual(actual, expected);
      });
    }
  }
});

describe("fromPosixPath", function() {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.posixPath}` : item.posixPath;
    test(title, () => {
      const expected: string = item.furi;
      const actual: string = fromPosixPath(item.posixPath).href;
      assert.strictEqual(actual, expected);
    });
  }
});
