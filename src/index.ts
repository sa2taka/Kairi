#!/usr/bin/env node
import { program } from "commander";
import { glob, hasMagic } from "glob";
import { setTimeout } from "timers/promises";
import { extractTarget } from "./libs/extract-target";
import { findDivergences } from "./libs/find-divergences";
import { Option, getOption, setOption } from "./global-option";

program
  .name("kairi")
  .description("Kairi is a tool for extracting comments from source code.")
  .usage("OPENAI_API_KEY=<your openai api key> kairi <filepath>")
  .version("0.0.1");

program
  .argument("<files...>", "target file path")
  .option("-c, --count", "count of target, do not run the ChatGPT", false)
  .option("-s, --strict", "more strict check", true)
  .option("-l, --language <language>", "language of the output", "en");

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
  const counts = await Promise.all(
    files.map(async (file) => {
      const targetCount = (await extractTarget(file)).length;
      return {
        filepath: file,
        count: targetCount,
      };
    })
  );

  counts.forEach(({ filepath, count }) => {
    console.log(`${count}:\t${filepath}`);
  });
  console.log("---");
  console.log(`${counts.reduce((acc, { count }) => acc + count, 0)}`);
};

const execMain = async () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not set.");
  }

  const files = await getTargetFiles();
  const targets = (
    await Promise.all(
      files.map(async (file) => {
        return extractTarget(file);
      })
    )
  ).flat();

  for (let index = 0; index < targets.length; index++) {
    const target = targets[index];
    setTimeout(100);
    const result = await findDivergences(target);
    if (!result) {
      console.warn(`${target.filepath} id failed chat.`);
      continue;
    }

    const { strict } = getOption();
    const threshold = strict ? 2 : 1;

    if (result.rate > threshold) {
      continue;
    }

    if (index !== 0) {
      console.log("\n---\n");
    }

    console.log(
      `# ${target.filepath}:${target.methodDeclarationPosition.line}:${target.methodDeclarationPosition.character}`
    );
    console.log(`${result.rate}: ${result.reason}`);
  }
};

program.parse(process.argv);
const option = program.opts<Option>();

setOption(option);

if (option.count) {
  execCount();
} else {
  execMain();
}
