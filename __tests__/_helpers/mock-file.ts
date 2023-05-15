import mockFs from "mock-fs";

export const mockFile = (filepath: string, content: string) => {
  mockFs({
    [filepath]: content,
  });
};

export const using = <T>(
  filepath: string,
  content: string,
  executor: () => T
): T => {
  mockFile(filepath, content);
  const result = executor();
  mockFs.restore();
  return result;
};

export const usingAsync = async <T>(
  filepath: string,
  content: string,
  executor: () => Promise<T>
): Promise<T> => {
  mockFile(filepath, content);
  const result = await executor();
  mockFs.restore();
  return result;
};
