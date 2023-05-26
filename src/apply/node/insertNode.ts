import { InsertNodeOperation } from "slate";

import { SyncValue } from "../../model";
import { getChildren, getParentFromDoc } from "../../path";

const insertNode = (doc: SyncValue, op: InsertNodeOperation): SyncValue => {
  const [parent, index] = getParentFromDoc(doc, op.path);

  if (parent.text != undefined) {
    throw new TypeError("Can't insert node into text node");
  }

  getChildren(parent).splice(index, 0, op.node);

  return doc;
};

export default insertNode;
