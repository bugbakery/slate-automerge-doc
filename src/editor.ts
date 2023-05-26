import { Transforms, Element, Editor, BaseEditor } from "slate";
import { unstable as Automerge } from "@automerge/automerge";

import nTimes from "./utils/nTimes";
import { applyOperation } from "./apply";

function updateNode(
  editor: Editor,
  oldNode: Node,
  newNode: Node,
  path: number[] = []
) {
  if (!Element.isAncestor(newNode)) return;

  newNode.children.forEach((child, i) => {
    const oldChild = Element.isAncestor(oldNode) && oldNode.children?.[i];

    if (!oldChild) {
      Transforms.insertNodes(editor, [JSON.parse(JSON.stringify(child))], { at: [...path, i] });
      return;
    }

    // const id = Automerge.getObjectId(child);
    // const oldId = Automerge.getObjectId(oldChild);
    const stringifiedChild = JSON.stringify(child);
    const stringifiedOldChild = JSON.stringify(oldChild);
    // console.assert((id == oldId) == (stringifiedChild == stringifiedOldChild));
    // console.log(id);
    // console.log(oldId);
    // console.log(stringifiedChild);
    // console.log(stringifiedOldChild);
    // console.log(id == oldId);
    // console.log(stringifiedChild == stringifiedOldChild);

    if (
      stringifiedChild.length != stringifiedOldChild.length ||
      stringifiedChild != stringifiedOldChild
    ) {
      Transforms.removeNodes(editor, { at: [...path, i] });
      Transforms.insertNodes(editor, JSON.parse(JSON.stringify(child)), { at: [...path, i] });
    }
  });

  if (Element.isAncestor(oldNode)) {
    const excessiveChildren = oldNode.children.length - newNode.children.length;
    nTimes(excessiveChildren, () => {
      Transforms.removeNodes(editor, {
        at: [...path, newNode.children.length],
      });
    });
  }
}

export type AutomergeEditor = BaseEditor & {
  isRemote: boolean;
  doc: Automerge.Doc<any>;
  onDocChange?: (doc: Automerge.Doc<any>) => void;
  setDoc: (doc: Automerge.Doc<any>) => void;
};

export function withAutomergeDoc<T extends BaseEditor>(
  editor: T,
  initialDoc: Automerge.Doc<any>
): T & AutomergeEditor {
  const e = editor as T & AutomergeEditor;
  e.isRemote = false;
  e.doc = initialDoc;

  e.setDoc = (newDoc) => {
    const oldDoc = e.doc;
    e.doc = initialDoc;

    // const newDocView = Automerge.view(newDoc, Automerge.getHeads(newDoc));
    // const currentDocCopy = Automerge.view(oldDoc, Automerge.getHeads(e.doc));

    const newDocView = JSON.parse(JSON.stringify(newDoc));
    const currentDocCopy = JSON.parse(JSON.stringify(oldDoc));

    e.isRemote = true;
    Editor.withoutNormalizing(e, () => {
      // updateNode(e, currentDocCopy, newDocView);
      updateNode(e, oldDoc, newDoc);
    });
    Promise.resolve().then(() => (e.isRemote = false));
    e.doc = newDoc;
  };

  const oldOnChange = e.onChange;

  // use varargs to support future slate versions
  e.onChange = (...args) => {
    if (!e.isRemote) {
      if (e.operations.length > 0) {
        if (e.operations.some((op) => op.type != "set_selection")) {
          const newDoc = Automerge.change(e.doc, (draft) => {
            // apply all outstanding operations
            e.operations.forEach((op) => {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              applyOperation(draft as any, op);
            });
          });

          e.doc = newDoc;
          e.onDocChange?.(newDoc);
        }
      }
    }

    oldOnChange(...args);
  };

  return e;
}
