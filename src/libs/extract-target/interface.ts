import { Target } from "../common/models/target";

export type ExtractTargetInterface = (filepath: string) => Promise<Target[]>;
