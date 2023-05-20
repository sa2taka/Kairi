import { extname } from "path";
import typescript from "./typescript";
import { ExtractTargetInterface } from "./interface";

const parsers = {
  javascript: typescript,
  typescript,
} as const;

const allot = (filepath: string): keyof typeof parsers | undefined => {
  const ext = extname(filepath);

  switch (ext) {
    case ".js":
    case ".jsx":
      return "javascript";
    case ".ts":
    case ".tsx":
      return "typescript";
    default:
      console.warn(`Unsupported file: ${filepath}`);
  }
};

export const extractTarget: ExtractTargetInterface = async (filepath) => {
  const type = allot(filepath);
  if (!type) {
    return [];
  }
  const parser = parsers[type];
  return parser(filepath);
};
