import { SetNodeOperation } from "slate";

import { SyncValue } from "../../model";
import { getTargetFromDoc } from "../../path";

const setNode = (doc: SyncValue, op: SetNodeOperation): SyncValue => {
  const node = getTargetFromDoc(doc, op.path);

  const { newProperties, properties } = op;

  for (let key in newProperties) {
    const value = newProperties[key];
    node[key] = value;
  }
  for (let key in properties) {
    if (!(key in newProperties)) {
      delete node[key];
    }
  }

  return doc;
};

export default setNode;
