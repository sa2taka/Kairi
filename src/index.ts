#!/usr/bin/env node
import { program } from "commander";
import { glob, hasMagic } from "glob";
import { extractTarget } from "./libs/extract-target";

program
  .name("kairi")
  .description("Kairi is a tool for extracting comments from source code.")
  .usage("OPENAI_API_KEY=<your openai api key> kairi <filepath>")
  .version("0.0.1");

program
  .argument("<files...>", "target file path")
  .option("-c, --count", "count of target, do not run the ChatGPT", false);

const getTargetFiles = async (): Promise<string[]> => {
  const [...files] = program.args;
  return (
    await Promise.all(
      files.map((filepath) => {
        if (hasMagic(filepath)) {
          return glob(filepath, { absolute: true });
        } else {
          return filepath;
        }
      })
    )
  ).flat();
};

const execCount = async () => {
  const files = await getTargetFiles();
  const counts = (
    await Promise.all(
      files.map(async (file) => {
        const targetCount = (await extractTarget(file)).length;
        return {
          filepath: file,
          count: targetCount,
        };
      })
    )
  ).flat();

  counts.forEach(({ filepath, count }) => {
    console.log(`${count}:\t${filepath}`);
  });
  console.log("---");
  console.log(`${counts.reduce((acc, { count }) => acc + count, 0)}`);
};

const execMain = async () => {
  // TODO: GPT
};

program.parse(process.argv);
const { count } = program.opts<{ count: boolean }>();

if (count) {
  execCount();
} else {
  execMain();
}
