import { SplitNodeOperation } from "slate";
import { next as Automerge } from "@automerge/automerge";

import { SyncValue } from "../../model";
import { getChildren, getParentFromDoc } from "../../path";
import { cloneNode } from "../../utils";

const splitNode = (doc: SyncValue, op: SplitNodeOperation): SyncValue => {
  const [parent, index] = getParentFromDoc(doc, op.path);
  const target = getChildren(parent)[index];

  const inject = {
    ...cloneNode(target),
    ...op.properties,
  };

  if (target.text != undefined) {
    if (target.text.length > op.position) {
      Automerge.splice(
        target,
        ["text"],
        op.position,
        target.text.length - op.position
      );
    }
    if (op.position) {
      inject.text = inject.text.substring(op.position);
    }
  } else {
    target.children.splice(op.position, target.children.length - op.position);
    op.position && inject.children.splice(0, op.position);
  }

  getChildren(parent).insertAt(index + 1, inject);

  return doc;
};

export default splitNode;
