import chai from "chai";
import { fromWindowsPath, toWindowsPath } from "../lib";

interface TestItem {
  name?: string;
  furi: string;
  windowsPath: string;
}

const testItems: TestItem[] = [
  {
    name: "simple",
    furi: "file:///C:/foo",
    windowsPath: "C:\\foo",
  },
  {
    name: "dir",
    furi: "file:///C:/dir/foo",
    windowsPath: "C:\\dir\\foo",
  },
  {
    name: "trailing separator",
    furi: "file:///C:/dir/",
    windowsPath: "C:\\dir\\",
  },
  {
    name: "space",
    furi: "file:///C:/foo%20bar",
    windowsPath: "C:\\foo bar",
  },
  {
    name: "question mark",
    furi: "file:///C:/foo%3Fbar",
    windowsPath: "C:\\foo?bar",
  },
  {
    name: "number sign",
    furi: "file:///C:/foo%23bar",
    windowsPath: "C:\\foo#bar",
  },
  {
    name: "ampersand",
    furi: "file:///C:/foo&bar",
    windowsPath: "C:\\foo&bar",
  },
  {
    name: "equals",
    furi: "file:///C:/foo=bar",
    windowsPath: "C:\\foo=bar",
  },
  {
    name: "colon",
    furi: "file:///C:/foo:bar",
    windowsPath: "C:\\foo:bar",
  },
  {
    name: "semicolon",
    furi: "file:///C:/foo;bar",
    windowsPath: "C:\\foo;bar",
  },
  {
    name: "percent",
    furi: "file:///C:/foo%25bar",
    windowsPath: "C:\\foo%bar",
  },
  {
    name: "backslash",
    furi: "file:///C:/foo/bar",
    windowsPath: "C:\\foo\\bar",
  },
  {
    name: "backspace",
    furi: "file:///C:/foo%08bar",
    windowsPath: "C:\\foo\bbar",
  },
  {
    name: "tab",
    furi: "file:///C:/foo%09bar",
    windowsPath: "C:\\foo\tbar",
  },
  {
    name: "newline",
    furi: "file:///C:/foo%0Abar",
    windowsPath: "C:\\foo\nbar",
  },
  {
    name: "newline",
    furi: "file:///C:/foo%0Dbar",
    windowsPath: "C:\\foo\rbar",
  },
  {
    name: "latin1",
    furi: "file:///C:/f%C3%B3%C3%B3b%C3%A0r",
    windowsPath: "C:\\fóóbàr",
  },
  {
    name: "euro sign (BMP code point)",
    furi: "file:///C:/%E2%82%AC",
    windowsPath: "C:\\€",
  },
  {
    name: "rocket emoji (non-BMP code point)",
    furi: "file:///C:/%F0%9F%9A%80",
    windowsPath: "C:\\🚀",
  },
];

describe("toWindowsPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.furi}` : item.furi;
    it(title, () => {
      const expected: string = item.windowsPath;
      const actual: string = toWindowsPath(item.furi);
      chai.assert.strictEqual(actual, expected);
    });
  }
});

describe("fromWindowsPath", function () {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.windowsPath}` : item.windowsPath;
    it(title, () => {
      const expected: string = item.furi;
      const actual: string = fromWindowsPath(item.windowsPath).href;
      chai.assert.strictEqual(actual, expected);
    });
  }
});
