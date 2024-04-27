import { MergeNodeOperation, Node } from "slate";
import { next as Automerge } from "@automerge/automerge";

import { SyncValue } from "../../model";
import { getChildren, getParentFromDoc } from "../../path";
import { cloneNode } from "../../utils";

const mergeNode = (doc: SyncValue, op: MergeNodeOperation): SyncValue => {
  const [parent, index]: [any, number] = getParentFromDoc(doc, op.path);

  const prev = parent[index - 1] || parent.children[index - 1];
  const next = parent[index] || parent.children[index];

  if (prev.text != undefined) {
    Automerge.splice(prev, ["text"], prev.text.length, 0, next.text);
  } else {
    getChildren(next).forEach((n: Node) =>
      getChildren(prev).push(cloneNode(n))
    );
  }

  getChildren(parent).deleteAt(index, 1);

  return doc;
};

export default mergeNode;
