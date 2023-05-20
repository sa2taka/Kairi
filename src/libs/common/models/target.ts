export type Target = {
  program: string;
  comment: string;
  methodDeclarationPosition: {
    line: number;
    character: number;
  };
  filepath: string;
};
