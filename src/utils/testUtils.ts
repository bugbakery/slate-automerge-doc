import { next as Automerge } from "@automerge/automerge";
import { Node } from "slate";

export const createText = (text: string = "") => ({
  text,
});

export const createNode = (
  type: string = "paragraph",
  text: string = "",
  data?: { [key: string]: any }
) => ({
  type,
  children: [createText(text)],
  ...data,
});

export const createValue = (children?: any): { children: Node[] } => ({
  children: children || [createNode()],
});

export const createDoc = (children?: any) =>
  Automerge.from(createValue(children));
