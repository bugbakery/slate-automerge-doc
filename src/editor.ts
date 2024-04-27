import { Transforms, Element, Editor, BaseEditor, Node } from "slate";
import { next as Automerge } from "@automerge/automerge";

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
      Transforms.insertNodes(editor, [JSON.parse(JSON.stringify(child))], {
        at: [...path, i],
      });
      return;
    }

    const stringifiedChild = JSON.stringify(child);
    const stringifiedOldChild = JSON.stringify(oldChild);

    if (
      stringifiedChild.length != stringifiedOldChild.length ||
      stringifiedChild != stringifiedOldChild
    ) {
      Transforms.removeNodes(editor, { at: [...path, i] });
      Transforms.insertNodes(editor, JSON.parse(JSON.stringify(child)), {
        at: [...path, i],
      });
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

type onDocChangeCallback<T> = (doc: Automerge.Doc<T>) => void;

export type AutomergeEditor<T> = BaseEditor & {
  isRemote: boolean;
  doc: Automerge.Doc<T>;
  addDocChangeListener: (callback: onDocChangeCallback<T>) => void;
  removeDocChangeListener: (callback: onDocChangeCallback<T>) => void;
  setDoc: (doc: Automerge.Doc<T>) => void;
  _callbacks: Set<onDocChangeCallback<T>>;
  v: number;
};

export function withAutomergeDoc<DT, T extends BaseEditor>(
  editor: T,
  initialDoc: Automerge.Doc<any>
): T & AutomergeEditor<DT> {
  const e = editor as T & AutomergeEditor<DT>;
  e.isRemote = false;
  e.doc = initialDoc;
  e._callbacks = new Set();
  e.v = 0;

  function callOnDocChange(e: AutomergeEditor<DT>) {
    e._callbacks.forEach((cb) => cb(e.doc));
  }

  e.addDocChangeListener = (cb) => {
    e._callbacks.add(cb);
  };

  e.removeDocChangeListener = (cb) => {
    e._callbacks.delete(cb);
  };

  e.setDoc = (newDoc) => {
    const oldDoc = e.doc;
    e.doc = initialDoc;

    e.isRemote = true;
    Editor.withoutNormalizing(e, () => {
      // updateNode(e, currentDocCopy, newDocView);
      updateNode(e, oldDoc, newDoc);
    });
    Promise.resolve().then(() => (e.isRemote = false));
    e.doc = newDoc;
    e.v += 1;
    callOnDocChange(e);
  };

  const oldOnChange = e.onChange;

  // use varargs to support future slate versions
  e.onChange = (...args) => {
    oldOnChange(...args);

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
          e.v += 1;
          callOnDocChange(e);
        }
      }
    }
  };

  return e;
}
