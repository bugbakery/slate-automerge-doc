export * from "./testUtils";

const toJS = (node: any) => {
  try {
    return JSON.parse(JSON.stringify(node));
  } catch (e) {
    console.error("Convert to js failed!!! Return null");
    return null;
  }
};

const cloneNode = (node: any) => toJS(node);

const toSlatePath = (path: any) =>
  path ? path.filter((d: any) => Number.isInteger(d)) : [];

export { toJS, toSlatePath, cloneNode };
