import toSync from "./toSync";

export * from "./testUtils";

const toJS = (node: any) => {
  try {
    return JSON.parse(JSON.stringify(node));
  } catch (e) {
    console.error("Convert to js failed!!! Return null");
    return null;
  }
};

const cloneNode = (node: any) => toSync(toJS(node));

const toSlatePath = (path: any) =>
  path ? path.filter((d: any) => Number.isInteger(d)) : [];

export { toSync, toJS, toSlatePath, cloneNode };
