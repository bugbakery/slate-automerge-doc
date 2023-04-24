import { AutomergeEditor } from "./editor";

declare module "slate" {
  interface CustomTypes {
    Editor: AutomergeEditor;
  }
}
