import Automerge from "@automerge/automerge";
import { Node } from "slate";

export type SyncValue = Automerge.List<Node>;
export type SyncDoc = Automerge.Doc<{ children: SyncValue }>;
