import * as assert from "node:assert/strict";
import {describe, test} from "node:test";
import cp from "node:child_process";
import fs from "node:fs/promises";
import sysPath from "node:path";
import { fromSysPath, toSysPath } from "../lib/index.mjs";

interface TestItem {
  name?: string;
  basename: string;
}

const testItems: TestItem[] = [
  { name: "simple", basename: "foo" },
  { name: "space", basename: "foo bar" },
  { name: "question mark", basename: "foo?bar" },
  { name: "number sign", basename: "foo#bar" },
  { name: "ampersand", basename: "foo&bar" },
  { name: "equals", basename: "foo=bar" },
  { name: "colon", basename: "foo:bar" },
  { name: "semicolon", basename: "foo;bar" },
  { name: "percent", basename: "foo%bar" },
  // https://github.com/nodejs/node/pull/23720
  // {name: "backslash", basename: "foo\\bar"},
  // {name: "tab", basename: "foo\tbar"},
  // {name: "new line", basename: "foo\nbar"},
  // Backspace seems to break the inspector
  // {name: "backspace", basename: "foo\bbar"},
  { name: "latin1", basename: "fóóbàr" },
  { name: "euro sign (BMP code point)", basename: "€" },
  { name: "rocket emoji (non-BMP code point)", basename: "/🚀" },
];

describe("modules", () => {
  for (const item of testItems) {
    const title: string = item.name !== undefined ? `${item.name}: ${item.basename}` : item.basename;
    test(title, async () => {
      const { furi, sysPath } = await resolveTestItem(item.basename);
      const errMessage: string = JSON.stringify({ furi, sysPath });
      assert.strictEqual(fromSysPath(sysPath).href, furi, `fromSysPath: ${errMessage}`);
      assert.strictEqual(toSysPath(furi), sysPath, `toSysPath: ${errMessage}`);
    });
  }
});

async function withTmpDir<R = unknown>(handler: (path: string) => Promise<R>): Promise<R> {
  const tempDir = await fs.mkdtemp("furi-", { encoding: "utf-8" });
  try {
    return await handler(tempDir);
  } finally {
    await fs.rm(tempDir, { recursive: true });
  }
}

async function getEsmMetaUrl(dir: string, name: string): Promise<string> {
  const filePath: string = sysPath.join(dir, name);
  const text: string = "process.stdout.write(Buffer.from(import.meta.url));\n";
  await fs.writeFile(filePath, text);
  const spawnResult: cp.SpawnSyncReturns<Buffer> = cp.spawnSync(
    process.execPath,
    [filePath],
  );
  if (spawnResult.status !== 0 || spawnResult.signal !== null) {
    throw new Error(`Unexpected process exit\n${spawnResult.stderr.toString("utf-8")}`);
  }
  return spawnResult.stdout.toString("utf-8");
}

async function getCjsFilename(dir: string, name: string): Promise<string> {
  const filePath: string = sysPath.join(dir, name);
  const text: string = "process.stdout.write(Buffer.from(__filename));\n";
  await fs.writeFile(filePath, text);
  const spawnResult: cp.SpawnSyncReturns<Buffer> = cp.spawnSync(process.execPath, [filePath]);
  if (spawnResult.status !== 0 || spawnResult.signal !== null) {
    throw new Error(`Unexpected process exit\n${spawnResult.stderr.toString("utf-8")}`);
  }
  return spawnResult.stdout.toString("utf-8");
}

interface ResolvedTestItem {
  furi: string;
  sysPath: string;
}

async function resolveTestItem(basename: string): Promise<ResolvedTestItem> {
  return withTmpDir(async (dir: string): Promise<ResolvedTestItem> => {
    const esmStr: string = await getEsmMetaUrl(dir, `${basename}.mjs`);
    const cjsStr: string = await getCjsFilename(dir, `${basename}.cjs`);
    return {
      furi: esmStr.replace(/\.mjs$/, ""),
      sysPath: cjsStr.replace(/\.cjs$/, ""),
    };
  });
}
