import { InsertTextOperation, RemoveTextOperation } from "slate";
import { next as Automerge } from "@automerge/automerge";

import { getTargetFromDoc } from "../path";
import { SyncValue } from "../model";

export const insertText = (
  doc: SyncValue,
  op: InsertTextOperation
): SyncValue => {
  const node = getTargetFromDoc(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  Automerge.splice(node, ["text"], offset, 0, op.text);

  return doc;
};

export const removeText = (
  doc: SyncValue,
  op: RemoveTextOperation
): SyncValue => {
  const node = getTargetFromDoc(doc, op.path);

  const offset = Math.min(node.text.length, op.offset);

  Automerge.splice(node, ["text"], offset, op.text.length);

  return doc;
};

export default {
  insert_text: insertText,
  remove_text: removeText,
};
