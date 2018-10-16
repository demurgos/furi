import isWindows from "is-windows";
import url from "url";

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

export function fromSysPath(path: string): string {
  return isWindows() ? fromWindowsPath(path) : fromPosixPath(path);
}

export function fromWindowsPath(path: string): string {
  return formatFileUrl(`/${toForwardSlashes(path)}`);
}

export function fromPosixPath(path: string): string {
  return formatFileUrl(path);
}

function toForwardSlashes(path: string): string {
  return path.replace(/\\/g, "/");
}

function toBackwardSlashes(path: string): string {
  return path.replace(/\//g, "\\");
}

const tmpFileUrl: url.URL = new url.URL("file:///");
function formatFileUrl(pathname: string) {
  tmpFileUrl.pathname = encodeURI(pathname);
  return tmpFileUrl.toString();
}
