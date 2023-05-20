import { readFile } from "fs/promises";
import * as path from "path";
import * as ts from "typescript";
import { Target } from "../../common/models/target";
import { ExtractTargetInterface } from "../interface";

const hasJsDoc = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  node: any
): node is ts.HasJSDoc & { jsDoc?: ts.JSDoc[] | null } => {
  return "jsDoc" in node;
};

const extractTarget: ExtractTargetInterface = async (filepath) => {
  const content = (await readFile(filepath)).toString();
  const filename = path.basename(filepath);

  const sourceFile = ts.createSourceFile(
    filename,
    content.toString(),
    ts.ScriptTarget.Latest,
    true
  );

  const targets: Target[] = [];

  const visit = (node: ts.Node) => {
    ts.forEachChild(node, (currentNode) => {
      if (hasJsDoc(currentNode) && currentNode.jsDoc) {
        const declarationText = currentNode.getText(sourceFile);

        const comment = currentNode.jsDoc
          .map((doc) => doc.getFullText())
          .join("\n");

        targets.push({
          program: declarationText,
          comment,
          methodDeclarationPosition: sourceFile.getLineAndCharacterOfPosition(
            currentNode.getStart()
          ),
          filepath,
        });
        visit(currentNode);
      } else {
        visit(currentNode);
      }
    });
  };

  visit(sourceFile);

  return targets;
};

export default extractTarget;
