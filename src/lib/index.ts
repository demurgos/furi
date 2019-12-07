/**
 * @module furi
 */

import assert from "assert";
import isWindows from "is-windows";
import url from "url";

class InvalidFileUri extends TypeError {
  public input: string;
  public code: string;

  constructor(input: string) {
    super();
    this.input = input;
    this.message = `Invalid file URI: ${input}`;
    this.name = "TypeError [ERR_INVALID_FILE_URI]";
    this.code = "ERR_INVALID_FILE_URI";
  }
}

/**
 * A class representing a normalized absolute `file://` URI.
 *
 * This is a subclass of `url.URL` with the following extra checks:
 * - The protocol is `file:`.
 * - The pathname does not contain consecutive slashes (`a//b`) ("normalization").
 * - The pathname does not contain the `.` or `..` segments (enforced by `url.URL` already).
 *
 * This class extends `url.URL`. This means that you can pass it to any
 * function expecting a `url.URL`. It also means that the URI is always
 * absolute.
 *
 * Notes:
 * - A single trailing slash is allowed.
 * - The hostname is allowed to be any string. A non-empty string is used by Windows to represents
 *   files on a network drive. An empty string means `localhost`.
 * - The `username`, `password` and `port` properties are always `""` (enforced by `url.URL`
 *   already for the `file:` protocol). This implies that `host` only contains `hostname`.
 * - The `search` and `hash` properties can have any value.
 */
export class Furi extends url.URL {
  constructor(input: UrlLike) {
    const strInput: string = `${input}`;
    super(strInput);
    if (this.protocol !== "file:") {
      throw new InvalidFileUri(strInput);
    }
    if (this.pathname.indexOf("//") >= 0) {
      this.pathname = this.pathname.replace(/\/+/g, "/");
    }
  }

  get protocol(): string {
    return super.protocol;
  }

  set protocol(value: string) {
    if (value !== "file:") {
      return;
    }
    super.protocol = value;
  }

  get pathname(): string {
    return super.pathname;
  }

  set pathname(value: string) {
    if (value.indexOf("//") >= 0) {
      value = value.replace(/\/+/g, "/");
    }
    super.pathname = value;
  }

  hasTrailingSlash(): boolean {
    return this.pathname !== "/" && this.pathname.endsWith("/");
  }

  setTrailingSlash(hasTrailingSlash: boolean): void {
    if (this.pathname === "/") {
      return;
    }
    if (this.pathname.endsWith("/")) {
      if (!hasTrailingSlash) {
        this.pathname = this.pathname.substring(0, this.pathname.length - 1);
      }
    } else if (hasTrailingSlash) {
      this.pathname = `${this.pathname}/`;
    }
  }
}

/**
 * A `URL` instance or valid _absolute_ URL string.
 */
export type UrlLike = url.URL | string;

/**
 * Normalizes the input to a `Furi` instance.
 *
 * @param input URL string or instance to normalize.
 * @returns `Furi` instance. It is always a new instance.
 */
export function asFuri(input: UrlLike): Furi {
  if (input instanceof url.URL) {
    return new Furi(input.toString());
  } else {
    return new Furi(input);
  }
}

/**
 * Normalizes the input to a writable `URL` instance.
 *
 * @param input URL string or instance to normalize.
 */
export function asWritableUrl(input: UrlLike): url.URL {
  return new url.URL(typeof input === "string" ? input : input.toString());
}

/**
 * Appends the provided components to the pathname of `base`.
 *
 * It does not mutate the inputs.
 * If component list is non-empty, the `hash` and `search` are set to the
 * empty string.
 *
 * @param base Base URL.
 * @param components Path components to append.
 * @returns Joined URL.
 */
export function join(base: UrlLike, components: ReadonlyArray<string>): Furi {
  const result: Furi = asFuri(base);
  if (components.length === 0) {
    return result;
  }
  result.setTrailingSlash(false);
  result.pathname = `${result.pathname}/${components.map(encodeURIComponent).join("/")}`;
  result.hash = "";
  result.search = "";
  return result;
}

/**
 * Joins a file URI with additional extra paths.
 *
 * This function preserves trailing slashes.
 *
 * @param base Base `file://` URI.
 * @param uriPaths Array of relative URI paths. The special characters must
 *        already be URI-encoded.
 * @returns Normalized absolute URI.
 */
export function append(base: UrlLike, ...uriPaths: readonly string[]): Furi {
  const result: Furi = asFuri(base);
  if (uriPaths.length === 0) {
    return result;
  }

  let hasTrailingSlash: boolean = result.hasTrailingSlash();
  const segments: string[] = result.pathname.split("/");
  for (const uriPath of uriPaths) {
    if (uriPath === "") {
      continue;
    }
    for (const segment of uriPath.split("/")) {
      segments.push(segment);
      hasTrailingSlash = segment === "";
    }
  }
  result.pathname = segments.join("/");
  result.setTrailingSlash(hasTrailingSlash);
  result.hash = "";
  result.search = "";
  return result;
}

/**
 * Returns the basename of the file URI.
 *
 * This function is similar to Node's `require("path").basename`.
 *
 * @param furi Absolute `file://` URI.
 * @param ext Extension (will be removed if present).
 * @returns URI-encoded basename.
 */
export function basename(furi: UrlLike, ext?: string): string {
  const readable: url.URL = asFuri(furi);
  const components: readonly string[] = readable.pathname
    .split("/")
    .filter(c => c !== "");
  const basename: string = components.length > 0 ? components[components.length - 1] : "";
  if (ext !== undefined && ext.length > 0 && ext.length < basename.length) {
    if (basename.endsWith(ext)) {
      return basename.substr(0, basename.length - ext.length);
    }
  }
  return basename;
}

/**
 * Returns the parent URL.
 *
 * If `input` is the root, it returns itself (saturation).
 * If `input` has a trailing separator, it is first removed.
 *
 * @param input Input URL.
 * @returns Parent URL.
 */
export function parent(input: UrlLike): url.URL {
  const writable: url.URL = asWritableUrl(input);
  const oldPathname: string = writable.pathname;
  const components: string[] = oldPathname.split("/");
  if (components[components.length - 1] === "") {
    // Remove trailing separator
    components.pop();
  }
  components.pop();
  writable.pathname = components.join("/");
  return writable;
}

/**
 * Converts a File URI to a system-dependent path.
 *
 * Use `toPosixPath`, `toWindowsShortPath` or `toWindowsLongPath` if you
 * want system-independent results.
 *
 * Example:
 * ```js
 * // On a Windows system:
 * toSysPath("file:///C:/dir/foo");
 * // -> "C:\\dir\\foo";
 * toSysPath("file:///C:/dir/foo", true);
 * // -> "\\\\?\\C:\\dir\\foo";
 *
 * // On a Posix system:
 * toSysPath("file:///dir/foo");
 * // -> "/dir/foo";
 * ```
 *
 * @param furi File URI to convert.
 * @param windowsLongPath Use long paths on Windows. (default: `false`)
 * @return System-dependent path.
 */
export function toSysPath(furi: string, windowsLongPath: boolean = false): string {
  if (isWindows()) {
    return windowsLongPath ? toWindowsLongPath(furi) : toWindowsShortPath(furi);
  } else {
    return toPosixPath(furi);
  }
}

/**
 * Converts a File URI to a Windows short path.
 *
 * The result is either a short device path or a short UNC server path.
 *
 * Example:
 * ```js
 * toSysPath("file:///C:/dir/foo");
 * // -> "C:\\dir\\foo";
 * toSysPath("file://server/Users/foo");
 * // -> "\\\\server\\Users\\foo";
 * ```
 *
 * @param furi File URI to convert.
 * @return Windows short path.
 */
export function toWindowsShortPath(furi: string): string {
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

/**
 * Converts a File URI to a Windows long path.
 *
 * The result is either a long device path or a long UNC server path.
 *
 * Example:
 * ```js
 * toWindowsPath("file:///C:/dir/foo");
 * // -> "\\\\?\\C:\\dir\\foo";
 * toWindowsPath("file://server/Users/foo");
 * // -> "\\\\?\\unc\\server\\Users\\foo";
 * ```
 *
 * @param furi File URI to convert.
 * @return Windows long path.
 */
export function toWindowsLongPath(furi: string): string {
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

/**
 * Converts a File URI to a Posix path.
 *
 * Requires the host to be either an empty string or `"localhost"`.
 *
 * Example:
 * ```js
 * toPosixPath("file:///dir/foo");
 * // -> "/dir/foo";
 * ```
 *
 * @param furi File URI to convert.
 * @return Posix path.
 */
export function toPosixPath(furi: string): string {
  const urlObj: url.URL = new url.URL(furi);
  if (urlObj.host !== "" && urlObj.host !== "localhost") {
    assert.fail(`Expected \`host\` to be "" or "localhost": ${furi}`);
  }
  const pathname: string = urlObj.pathname;
  return pathname.split("/").map(decodeURIComponent).join("/");
}

/**
 * Converts an absolute system-dependent path to a frozen URL object.
 *
 * Use `fromPosixPath` or `fromWindowsPath` if you want system-independent
 * results.
 *
 * Example:
 * ```js
 * // On a Windows system:
 * fromSysPath("C:\\dir\\foo");
 * // -> new URL("file:///C:/dir/foo");
 *
 * // On a Posix system:
 * fromSysPath("/dir/foo");
 * // -> new URL("file:///dir/foo");
 * ```
 *
 * @param absPath Absolute system-dependent path to convert
 * @return Frozen `file://` URL object.
 */
export function fromSysPath(absPath: string): url.URL {
  return isWindows() ? fromWindowsPath(absPath) : fromPosixPath(absPath);
}

const WINDOWS_PREFIX_REGEX: RegExp = /^[\\/]{2,}([^\\/]+)(?:$|[\\/]+)/;
const WINDOWS_UNC_REGEX: RegExp = /^unc(?:$|[\\/]+)([^\\/]+)(?:$|[\\/]+)/i;

/**
 * Converts an absolute Windows path to a frozen URL object.
 *
 * Example:
 * ```js
 * fromWindowsPath("C:\\dir\\foo");
 * // -> new URL(file:///C:/dir/foo");
 * fromWindowsPath("\\\\?\\unc\\server\\Users\\foo");
 * // -> new URL("file://server/Users/foo");
 * ```
 *
 * @param absPath Absolute Windows path to convert
 * @return Frozen `file://` URL object.
 */
export function fromWindowsPath(absPath: string): url.URL {
  const prefixMatch: RegExpExecArray | null = WINDOWS_PREFIX_REGEX.exec(absPath);
  if (prefixMatch === null) {
    // Short device path
    return formatFileUrl(`/${toForwardSlashes(absPath)}`);
  }
  const prefix: string = prefixMatch[1];
  const tail: string = absPath.substring(prefixMatch[0].length);
  if (prefix !== "?") {
    // Short server path
    const result: url.URL = new url.URL("file:///");
    result.host = prefix;
    result.pathname = encodeURI(`/${toForwardSlashes(tail)}`);
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
    return result;
  }
}

/**
 * Converts an absolute Posix path to a frozen URL object.
 *
 * Example:
 * ```js
 * fromPosixPath("/dir/foo");
 * // -> new URL(file:///dir/foo");
 * ```
 *
 * @param absPath Absolute Posix path to convert
 * @return Frozen `file://` URL object.
 */
export function fromPosixPath(absPath: string): url.URL {
  return formatFileUrl(absPath);
}

/**
 * Replaces all the backward slashes by forward slashes.
 *
 * @param str Input string.
 * @internal
 */
function toForwardSlashes(str: string): string {
  return str.replace(/\\/g, "/");
}

/**
 * Replaces all the forward slashes by backward slashes.
 *
 * @param str Input string.
 * @internal
 */
function toBackwardSlashes(str: string): string {
  return str.replace(/\//g, "\\");
}

/**
 * Creates a frozen `file://` URL using the supplied `pathname`.
 *
 * @param pathname Pathname for the URL object.
 * @return Frozen `file://` URL object.
 * @internal
 */
function formatFileUrl(pathname: string): url.URL {
  const result: url.URL = new url.URL("file:///");
  result.pathname = encodeURI(pathname);
  return result;
}
