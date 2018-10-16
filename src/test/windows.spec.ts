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
    name: "newline",
    furi: "file:///C:/foo%0Abar",
    windowsPath: "C:\\foo\nbar",
  },
  {
    name: "latin1",
    furi: "file:///C:/f%C3%B3%C3%B3",
    windowsPath: "C:\\fóó",
  },
  {
    name: "non-BMP char",
    furi: "file:///C:/%F0%9D%84%9E",
    windowsPath: "C:\\𝄞",
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
      const actual: string = fromWindowsPath(item.windowsPath);
      chai.assert.strictEqual(actual, expected);
    });
  }
});
