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
    name: "newline",
    furi: "file:///foo%0Abar",
    posixPath: "/foo\nbar",
  },
  {
    name: "latin1",
    furi: "file:///f%C3%B3%C3%B3",
    posixPath: "/fóó",
  },
  {
    name: "non-BMP char",
    furi: "file:///%F0%9D%84%9E",
    posixPath: "/𝄞",
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
      const actual: string = fromPosixPath(item.posixPath);
      chai.assert.strictEqual(actual, expected);
    });
  }
});
