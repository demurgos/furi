import chai from "chai";
import { fromPosixPath, toPosixPath } from "../lib";

interface TestItem {
  name?: string;
  furi: string;
  posixPath: string;
}

const testItems: TestItem[] = [
  {
    name: "simple",
    furi: "file:///foo",
    posixPath: "/foo",
  },
  {
    name: "dir",
    furi: "file:///dir/foo",
    posixPath: "/dir/foo",
  },
  {
    name: "trailing separator",
    furi: "file:///dir/",
    posixPath: "/dir/",
  },
  {
    name: "space",
    furi: "file:///foo%20bar",
    posixPath: "/foo bar",
  },
  {
    name: "question mark",
    furi: "file:///foo%3Fbar",
    posixPath: "/foo?bar",
  },
  {
    name: "number sign",
    furi: "file:///foo%23bar",
    posixPath: "/foo#bar",
  },
  {
    name: "ampersand",
    furi: "file:///foo&bar",
    posixPath: "/foo&bar",
  },
  {
    name: "equals",
    furi: "file:///foo=bar",
    posixPath: "/foo=bar",
  },
  {
    name: "colon",
    furi: "file:///foo:bar",
    posixPath: "/foo:bar",
  },
  {
    name: "semicolon",
    furi: "file:///foo;bar",
    posixPath: "/foo;bar",
  },
  {
    name: "percent",
    furi: "file:///foo%25bar",
    posixPath: "/foo%bar",
  },
  {
    name: "backslash",
    furi: "file:///foo%5Cbar",
    posixPath: "/foo\\bar",
  },
  {
    name: "backspace",
    furi: "file:///foo%08bar",
    posixPath: "/foo\bbar",
  },
  {
    name: "tab",
    furi: "file:///foo%09bar",
    posixPath: "/foo\tbar",
  },
  {
    name: "newline",
    furi: "file:///foo%0Abar",
    posixPath: "/foo\nbar",
  },
  {
    name: "newline",
    furi: "file:///foo%0Dbar",
    posixPath: "/foo\rbar",
  },
  {
    name: "latin1",
    furi: "file:///f%C3%B3%C3%B3b%C3%A0r",
    posixPath: "/fóóbàr",
  },
  {
    name: "euro sign (BMP code point)",
    furi: "file:///%E2%82%AC",
    posixPath: "/€",
  },
  {
    name: "rocket emoji (non-BMP code point)",
    furi: "file:///%F0%9F%9A%80",
    posixPath: "/🚀",
  },
];

describe("toPosixPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.furi}` : item.furi;
    it(title, () => {
      const expected: string = item.posixPath;
      const actual: string = toPosixPath(item.furi);
      chai.assert.strictEqual(actual, expected);
    });
  }
});

describe("fromPosixPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.posixPath}` : item.posixPath;
    it(title, () => {
      const expected: string = item.furi;
      const actual: string = fromPosixPath(item.posixPath).href;
      chai.assert.strictEqual(actual, expected);
    });
  }
});
