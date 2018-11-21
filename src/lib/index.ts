import assert from "assert";
import isWindows from "is-windows";
import url from "url";

export function toSysPath(furi: string, useLongWindowsPath: boolean = false): string {
  if (isWindows()) {
    return useLongWindowsPath ? toLongWindowsPath(furi) : toShortWindowsPath(furi);
  } else {
    return toPosixPath(furi);
  }
}

export function toShortWindowsPath(furi: string): string {
  const urlObj: url.URL = new url.URL(furi);
  if (urlObj.host === "") {
    // Local drive path
    const pathname: string = urlObj.pathname.substring(1);
    const forward: string = pathname.split("/").map(decodeURIComponent).join("/");
    return toBackwardSlashes(forward);
  } else {
    // Server path
    const pathname: string = new url.URL(furi).pathname;
    const forward: string = pathname.split("/").map(decodeURIComponent).join("/");
    const backward: string = toBackwardSlashes(forward);
    return `\\\\${urlObj.host}${backward}`;
  }
}

export function toLongWindowsPath(furi: string): string {
  const urlObj: url.URL = new url.URL(furi);
  if (urlObj.host === "") {
    // Local drive path
    const pathname: string = urlObj.pathname.substring(1);
    const forward: string = pathname.split("/").map(decodeURIComponent).join("/");
    const backward: string = toBackwardSlashes(forward);
    return `\\\\?\\${backward}`;
  } else {
    // Server path
    const pathname: string = new url.URL(furi).pathname;
    const forward: string = pathname.split("/").map(decodeURIComponent).join("/");
    const backward: string = toBackwardSlashes(forward);
    return `\\\\?\\unc\\${urlObj.host}${backward}`;
  }
}

export function toPosixPath(furi: string): string {
  const urlObj: url.URL = new url.URL(furi);
  if (urlObj.host !== "" && urlObj.host !== "localhost") {
    assert.fail(`Expected \`host\` to be "" or "localhost": ${furi}`);
  }
  const pathname: string = urlObj.pathname;
  return pathname.split("/").map(decodeURIComponent).join("/");
}

export function fromSysPath(path: string): url.URL {
  return isWindows() ? fromWindowsPath(path) : fromPosixPath(path);
}

const WINDOWS_PREFIX_REGEX: RegExp = /^[\\/]{2,}([^\\/]+)(?:$|[\\/]+)/;
const WINDOWS_UNC_REGEX: RegExp = /^unc(?:$|[\\/]+)([^\\/]+)(?:$|[\\/]+)/i;

export function fromWindowsPath(path: string): url.URL {
  const prefixMatch: RegExpExecArray | null = WINDOWS_PREFIX_REGEX.exec(path);
  if (prefixMatch === null) {
    // Short device path
    return formatFileUrl(`/${toForwardSlashes(path)}`);
  }
  const prefix: string = prefixMatch[1];
  const tail: string = path.substring(prefixMatch[0].length);
  if (prefix !== "?") {
    // Short server path
    const result: url.URL = new url.URL("file:///");
    result.host = prefix;
    result.pathname = encodeURI(`/${toForwardSlashes(tail)}`);
    freezeUrl(result);
    return result;
  }
  // Long path
  const uncMatch: RegExpExecArray | null = WINDOWS_UNC_REGEX.exec(tail);
  if (uncMatch === null) {
    // Long device path
    return formatFileUrl(`/${toForwardSlashes(tail)}`);
  } else {
    // Long server path
    const host: string = uncMatch[1];
    const serverPath: string = tail.substring(uncMatch[0].length);
    const result: url.URL = new url.URL("file:///");
    result.host = host;
    result.pathname = encodeURI(`/${toForwardSlashes(serverPath)}`);
    freezeUrl(result);
    return result;
  }
}

export function fromPosixPath(path: string): url.URL {
  return formatFileUrl(path);
}

function toForwardSlashes(path: string): string {
  return path.replace(/\\/g, "/");
}

function toBackwardSlashes(path: string): string {
  return path.replace(/\//g, "\\");
}

function formatFileUrl(pathname: string): url.URL {
  const result: url.URL = new url.URL("file:///");
  result.pathname = encodeURI(pathname);
  freezeUrl(result);
  return result;
}

function freezeUrl(writableUrl: url.URL): void {
  Object.freeze(writableUrl.searchParams);
  Object.freeze(writableUrl);
}
