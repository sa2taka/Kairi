import mockFs from "mock-fs";
import * as path from "path";
import extractTarget from "../../../../src/libs/extract-target/typescript";
import { usingAsync } from "../../../_helpers/mock-file";

describe("extract-target/typescript", () => {
  it("should return targets from function declarations", async () => {
    const source = `/**
 * declaration2 Line 1
 * declaration2 Line 2
 */
const declaration1 = () => {
  return "declaration1";
};

/**
 * declaration2 Line 1
 * declaration2 Line 2
 */
function declaration2 () {
  return "declaration2";
}

/**
 * declaration3 Line 1
 * declaration3 Line 2
 */
const declaration3 = function () {
  return "declaration3";
}
`;

    const filename = "test.ts";

    const targets = await usingAsync(filename, source, () =>
      extractTarget(path.join(process.cwd(), filename))
    );

    mockFs.restore();

    expect(targets).toEqual([
      {
        comment: "/**\n * declaration2 Line 1\n * declaration2 Line 2\n */",
        program: 'const declaration1 = () => {\n  return "declaration1";\n};',
        methodDeclarationPosition: { line: 4, character: 0 },
      },
      {
        comment: "/**\n * declaration2 Line 1\n * declaration2 Line 2\n */",
        program: 'function declaration2 () {\n  return "declaration2";\n}',
        methodDeclarationPosition: { line: 12, character: 0 },
      },
      {
        comment: "/**\n * declaration3 Line 1\n * declaration3 Line 2\n */",
        program:
          'const declaration3 = function () {\n  return "declaration3";\n}',
        methodDeclarationPosition: { line: 20, character: 0 },
      },
    ]);
  });
});
