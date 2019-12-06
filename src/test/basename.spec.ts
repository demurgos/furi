import chai from "chai";
import url from "url";
import { basename } from "../lib";

interface TestItem {
  readonly name?: string;
  readonly furi: string;
  readonly ext?: string;
  readonly expected: string;
}

const testItems: TestItem[] = [
  // assert.strictEqual(path.basename(__filename), 'test-path-basename.js');
  // assert.strictEqual(path.basename(__filename, '.js'), 'test-path-basename');
  // assert.strictEqual(path.basename('.js', '.js'), '');
  // assert.strictEqual(path.basename(''), '');
  {
    furi: "file:///dir/basename.ext",
    expected: "basename.ext",
  },
  {
    furi: "file:///basename.ext",
    expected: "basename.ext",
  },
  // assert.strictEqual(path.basename('basename.ext'), 'basename.ext');
  // assert.strictEqual(path.basename('basename.ext/'), 'basename.ext');
  // assert.strictEqual(path.basename('basename.ext//'), 'basename.ext');
  // assert.strictEqual(path.basename('aaa/bbb', '/bbb'), 'bbb');
  // assert.strictEqual(path.basename('aaa/bbb', 'a/bbb'), 'bbb');
  // assert.strictEqual(path.basename('aaa/bbb', 'bbb'), 'bbb');
  // assert.strictEqual(path.basename('aaa/bbb//', 'bbb'), 'bbb');
  // assert.strictEqual(path.basename('aaa/bbb', 'bb'), 'b');
  // assert.strictEqual(path.basename('aaa/bbb', 'b'), 'bb');
  {
    furi: "file:///aaa/bbb",
    ext: "/bbb",
    expected: "bbb",
  },
  {
    furi: "file:///aaa/bbb",
    ext: "a/bbb",
    expected: "bbb",
  },
  {
    furi: "file:///aaa/bbb",
    ext: "bbb",
    expected: "bbb",
  },
  {
    furi: "file:///aaa/bbb//",
    ext: "bbb",
    expected: "bbb",
  },
  {
    furi: "file:///aaa/bbb",
    ext: "bb",
    expected: "b",
  },
  {
    furi: "file:///aaa/bbb",
    ext: "b",
    expected: "bb",
  },
  {
    furi: "file:///aaa/bbb",
    expected: "bbb",
  },
  {
    furi: "file:///aaa/",
    expected: "aaa",
  },
  {
    furi: "file:///aaa/b",
    expected: "b",
  },
  {
    furi: "file:///a/b",
    expected: "b",
  },
  {
    furi: "file:////a",
    expected: "a",
  },
  // assert.strictEqual(path.basename('a', 'a'), '');
];

describe("basename", function () {
  for (const {name, furi, ext, expected} of testItems) {
    {
      const inputString: string = `(${JSON.stringify(furi)}, ${ext !== undefined ? JSON.stringify(ext) : "undefined"})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: string = basename(furi, ext);
        chai.assert.strictEqual(actual, expected);
      });
    }
    {
      const inputString: string = `(new url.URL(${JSON.stringify(furi)}), ${ext !== undefined ? JSON.stringify(ext) : "undefined"}})`;
      const title: string = name !== undefined ? `${name}: ${inputString}` : inputString;
      it(title, () => {
        const actual: string = basename(new url.URL(furi), ext);
        chai.assert.strictEqual(actual, expected);
      });
    }
  }
});
