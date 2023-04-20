import { Transforms, Element, Editor } from "slate";
import * as Automerge from "@automerge/automerge";

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
      Transforms.insertNodes(editor, [child], { at: [...path, i] });
      return;
    }

    const stringifiedChild = JSON.stringify(child);
    const stringifiedOldChild = JSON.stringify(oldChild);

    if (
      stringifiedChild.length != stringifiedOldChild.length ||
      stringifiedChild != stringifiedOldChild
    ) {
      Transforms.removeNodes(editor, { at: [...path, i] });
      Transforms.insertNodes(editor, child, { at: [...path, i] });
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

type AutomergeEditorProps = {
  isRemote: boolean;
  doc: Automerge.Doc<any>;
  onDocChange?: (doc: Automerge.Doc<any>) => void;
  setDoc: (doc: Automerge.Doc<any>) => void;
};

export function withAutomergeDoc<T extends Editor>(
  editor: T,
  initialDoc: Automerge.Doc<any>
): T & AutomergeEditorProps {
  const e = editor as T & AutomergeEditorProps;
  e.isRemote = false;
  e.doc = initialDoc;

  e.setDoc = (newDoc) => {
    const newDocView = JSON.parse(JSON.stringify(newDoc));
    const currentDocCopy = JSON.parse(JSON.stringify(e.doc));

    e.isRemote = true;
    Editor.withoutNormalizing(e, () => {
      updateNode(e, currentDocCopy, newDocView);
    });
    Promise.resolve().then(() => (e.isRemote = false));
    e.doc = newDoc;
  };

  const oldOnChange = editor.onChange;
  e.onChange = (options) => {
    if (!e.isRemote) {
      if (e.operations.length > 0) {
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

    oldOnChange(options);
  };

  return e;
}
