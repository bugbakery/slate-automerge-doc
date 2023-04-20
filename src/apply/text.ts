import { InsertTextOperation, RemoveTextOperation } from 'slate'

import { getTargetFromDoc } from '../path'
import { SyncValue } from '../model'

export const insertText = (
  doc: SyncValue,
  op: InsertTextOperation
): SyncValue => {
  const node = getTargetFromDoc(doc, op.path)

  const offset = Math.min(node.text.length, op.offset)

  node.text.insertAt(offset, ...op.text)

  return doc
}

export const removeText = (
  doc: SyncValue,
  op: RemoveTextOperation
): SyncValue => {
  const node = getTargetFromDoc(doc, op.path)

  const offset = Math.min(node.text.length, op.offset)

  node.text.deleteAt(offset, op.text.length)

  return doc
}

export default {
  insert_text: insertText,
  remove_text: removeText
}
