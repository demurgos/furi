import chai from "chai";
import { fromWindowsPath, Furi, toWindowsLongPath, toWindowsShortPath } from "../lib";

interface TestItem {
  name?: string;
  furi: string;
  shortWindowsPath: string;
  longWindowsPath: string;
  otherPaths: string[];
}

const testItems: TestItem[] = [
  {
    name: "lowercase ascii alpha",
    furi: "file:///C:/foo",
    shortWindowsPath: "C:\\foo",
    longWindowsPath: "\\\\?\\C:\\foo",
    otherPaths: [],
  },
  {
    name: "uppercase ascii alpha",
    furi: "file:///C:/FOO",
    shortWindowsPath: "C:\\FOO",
    longWindowsPath: "\\\\?\\C:\\FOO",
    otherPaths: [],
  },
  {
    name: "dir",
    furi: "file:///C:/dir/foo",
    shortWindowsPath: "C:\\dir\\foo",
    longWindowsPath: "\\\\?\\C:\\dir\\foo",
    otherPaths: [],
  },
  {
    name: "trailing separator",
    furi: "file:///C:/dir/",
    shortWindowsPath: "C:\\dir\\",
    longWindowsPath: "\\\\?\\C:\\dir\\",
    otherPaths: [],
  },
  {
    name: "space",
    furi: "file:///C:/foo%20bar",
    shortWindowsPath: "C:\\foo bar",
    longWindowsPath: "\\\\?\\C:\\foo bar",
    otherPaths: [],
  },
  {
    name: "question mark",
    furi: "file:///C:/foo%3Fbar",
    shortWindowsPath: "C:\\foo?bar",
    longWindowsPath: "\\\\?\\C:\\foo?bar",
    otherPaths: [],
  },
  {
    name: "number sign",
    furi: "file:///C:/foo%23bar",
    shortWindowsPath: "C:\\foo#bar",
    longWindowsPath: "\\\\?\\C:\\foo#bar",
    otherPaths: [],
  },
  {
    name: "ampersand",
    furi: "file:///C:/foo&bar",
    shortWindowsPath: "C:\\foo&bar",
    longWindowsPath: "\\\\?\\C:\\foo&bar",
    otherPaths: [],
  },
  {
    name: "equals",
    furi: "file:///C:/foo=bar",
    shortWindowsPath: "C:\\foo=bar",
    longWindowsPath: "\\\\?\\C:\\foo=bar",
    otherPaths: [],
  },
  {
    name: "colon",
    furi: "file:///C:/foo:bar",
    shortWindowsPath: "C:\\foo:bar",
    longWindowsPath: "\\\\?\\C:\\foo:bar",
    otherPaths: [],
  },
  {
    name: "semicolon",
    furi: "file:///C:/foo;bar",
    shortWindowsPath: "C:\\foo;bar",
    longWindowsPath: "\\\\?\\C:\\foo;bar",
    otherPaths: [],
  },
  {
    name: "percent",
    furi: "file:///C:/foo%25bar",
    shortWindowsPath: "C:\\foo%bar",
    longWindowsPath: "\\\\?\\C:\\foo%bar",
    otherPaths: [],
  },
  {
    name: "backslash",
    furi: "file:///C:/foo/bar",
    shortWindowsPath: "C:\\foo\\bar",
    longWindowsPath: "\\\\?\\C:\\foo\\bar",
    otherPaths: [],
  },
  {
    name: "backspace",
    furi: "file:///C:/foo%08bar",
    shortWindowsPath: "C:\\foo\bbar",
    longWindowsPath: "\\\\?\\C:\\foo\bbar",
    otherPaths: [],
  },
  {
    name: "tab",
    furi: "file:///C:/foo%09bar",
    shortWindowsPath: "C:\\foo\tbar",
    longWindowsPath: "\\\\?\\C:\\foo\tbar",
    otherPaths: [],
  },
  {
    name: "newline",
    furi: "file:///C:/foo%0Abar",
    shortWindowsPath: "C:\\foo\nbar",
    longWindowsPath: "\\\\?\\C:\\foo\nbar",
    otherPaths: [],
  },
  {
    name: "carriage return",
    furi: "file:///C:/foo%0Dbar",
    shortWindowsPath: "C:\\foo\rbar",
    longWindowsPath: "\\\\?\\C:\\foo\rbar",
    otherPaths: [],
  },
  {
    name: "latin1",
    furi: "file:///C:/f%C3%B3%C3%B3b%C3%A0r",
    shortWindowsPath: "C:\\fóóbàr",
    longWindowsPath: "\\\\?\\C:\\fóóbàr",
    otherPaths: [],
  },
  {
    name: "euro sign (BMP code point)",
    furi: "file:///C:/%E2%82%AC",
    shortWindowsPath: "C:\\€",
    longWindowsPath: "\\\\?\\C:\\€",
    otherPaths: [],
  },
  {
    name: "rocket emoji (non-BMP code point)",
    furi: "file:///C:/%F0%9F%9A%80",
    shortWindowsPath: "C:\\🚀",
    longWindowsPath: "\\\\?\\C:\\🚀",
    otherPaths: [],
  },
  {
    name: "simple (server)",
    furi: "file://server/foo",
    shortWindowsPath: "\\\\server\\foo",
    longWindowsPath: "\\\\?\\unc\\server\\foo",
    otherPaths: ["\\\\?\\UNC\\server\\foo", "//?\\unc\\server\\foo"],
  },
  {
    name: "dir (server)",
    furi: "file://server/dir/foo",
    shortWindowsPath: "\\\\server\\dir\\foo",
    longWindowsPath: "\\\\?\\unc\\server\\dir\\foo",
    otherPaths: ["\\\\?\\UNC\\server\\dir\\foo", "//?\\unc\\server\\dir\\foo"],
  },
];

describe("toWindowsShortPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.furi}` : item.furi;
    it(title, () => {
      const expected: string = item.shortWindowsPath;
      const actual: string = toWindowsShortPath(item.furi);
      chai.assert.strictEqual(actual, expected);
    });
    it(`${title} (Furi)`, () => {
      const expected: string = item.shortWindowsPath;
      const actual: string = new Furi(item.furi).toWindowsShortPath();
      chai.assert.strictEqual(actual, expected);
    });
  }
});

describe("toWindowsLongPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.furi}` : item.furi;
    it(title, () => {
      const expected: string = item.longWindowsPath;
      const actual: string = toWindowsLongPath(item.furi);
      chai.assert.strictEqual(actual, expected);
    });
    it(`${title} (Furi)`, () => {
      const expected: string = item.longWindowsPath;
      const actual: string = new Furi(item.furi).toWindowsLongPath();
      chai.assert.strictEqual(actual, expected);
    });
  }
});

describe("fromWindowsPath", function () {
  for (const item of testItems) {
    const expected: string = item.furi;
    const inputs: string[] = [item.shortWindowsPath, item.longWindowsPath, ...item.otherPaths];
    for (const input of inputs) {
      const title: string = item.name !== undefined ? `${item.name}: ${input}` : input;
      it(title, () => {
        const actual: string = fromWindowsPath(input).href;
        chai.assert.strictEqual(actual, expected);
      });
    }
  }
});
