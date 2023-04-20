import { Prop } from "@automerge/automerge";
import { Element, Path } from "slate";

import { SyncDoc, SyncValue } from "./model";

export const isTree = (node: Element): boolean => Boolean(node?.children);

export const getTarget = (doc: Element, path: Path) => {
  const iterate = (current: any, idx: number) => {
    if (!(isTree(current) || current[idx])) {
      throw new TypeError(
        `path ${path.toString()} does not match tree ${JSON.stringify(current)}`
      );
    }

    return current[idx] || current?.children[idx];
  };

  return path.reduce(iterate, doc);
};

export const getTargetFromDoc = (
  doc: SyncValue | SyncDoc,
  path: Prop[]
): any => {
  return path.reduce((current: any, part) => {
    if (!(isTree(current as any) || current[part])) {
      throw new TypeError(
        `path ${part} does not match tree ${JSON.stringify(current)}`
      );
    }

    return current[part] || current?.children[part];
  }, doc);
};

export const getParentPath = (
  path: Path,
  level: number = 1
): [number, Path] => {
  if (level > path.length) {
    throw new TypeError("requested ancestor is higher than root");
  }

  return [path[path.length - level], path.slice(0, path.length - level)];
};

export const getParent = (
  doc: Element,
  path: Path,
  level = 1
): [any, number] => {
  const [idx, parentPath] = getParentPath(path, level);

  return [getTarget(doc, parentPath), idx];
};

export const getParentFromDoc = (
  doc: SyncValue,
  path: Path,
  level = 1
): [any, number] => {
  const [idx, parentPath] = getParentPath(path, level);

  return [getTargetFromDoc(doc, parentPath), idx];
};

export const getChildren = (node: any) => node.children || node;
