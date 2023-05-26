import { MoveNodeOperation } from "slate";

import { cloneNode } from "../../utils";
import { SyncValue } from "../../model";
import { getChildren, getParentFromDoc } from "../../path";

const moveNode = (doc: SyncValue, op: MoveNodeOperation): SyncValue => {
  const [from, fromIndex] = getParentFromDoc(doc, op.path);
  const [to, toIndex] = getParentFromDoc(doc, op.newPath);

  if (from.text != undefined || to.text != undefined) {
    throw new TypeError("Can't move node as child of a text node");
  }

  getChildren(to).splice(
    toIndex,
    0,
    ...getChildren(from).splice(fromIndex, 1).map(cloneNode)
  );

  return doc;
};

export default moveNode;
