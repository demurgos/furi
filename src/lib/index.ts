import isWindows from "is-windows";
import url from "url";

export interface ReadonlyURLSearchParams extends Iterable<[string, string]> {
  entries(): IterableIterator<[string, string]>;

  forEach(callback: (value: string, name: string, searchParams: this) => void): void;

  get(name: string): string | null;

  getAll(name: string): string[];

  has(name: string): boolean;

  keys(): IterableIterator<string>;

  toString(): string;

  values(): IterableIterator<string>;

  [Symbol.iterator](): IterableIterator<[string, string]>;
}

export interface ReadonlyURL {
  readonly hash: string;
  readonly host: string;
  readonly hostname: string;
  readonly href: string;
  readonly origin: string;
  readonly password: string;
  readonly pathname: string;
  readonly port: string;
  readonly protocol: string;
  readonly search: string;
  readonly searchParams: ReadonlyURLSearchParams;
  readonly username: string;

  toString(): string;

  toJSON(): string;
}

export interface Furi extends ReadonlyURL {
  readonly host: "";
  readonly hostname: "";
  readonly password: "";
  readonly port: "";
  readonly protocol: "file:";
}

export function toSysPath(furi: string): string {
  return isWindows() ? toWindowsPath(furi) : toPosixPath(furi);
}

export function toWindowsPath(furi: string): string {
  const pathname: string = new url.URL(furi).pathname.substring(1);
  const forward: string = pathname.split("/").map(decodeURIComponent).join("/");
  // const forward: string = decodeURI(pathname.substr(1));
  return toBackwardSlashes(forward);
}

export function toPosixPath(furi: string): string {
  const pathname: string = new url.URL(furi).pathname;
  return pathname.split("/").map(decodeURIComponent).join("/");
}

export function fromSysPath(path: string): Furi {
  return isWindows() ? fromWindowsPath(path) : fromPosixPath(path);
}

export function fromWindowsPath(path: string): Furi {
  return formatFileUrl(`/${toForwardSlashes(path)}`);
}

export function fromPosixPath(path: string): Furi {
  return formatFileUrl(path);
}

function toForwardSlashes(path: string): string {
  return path.replace(/\\/g, "/");
}

function toBackwardSlashes(path: string): string {
  return path.replace(/\//g, "\\");
}

function formatFileUrl(pathname: string): Furi {
  const result: url.URL = new url.URL("file:///");
  result.pathname = encodeURI(pathname);
  freezeUrl(result);
  return result as Furi;
}

function freezeUrl(writableUrl: url.URL): void {
  Object.freeze(writableUrl.searchParams);
  Object.freeze(writableUrl);
}
