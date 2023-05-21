# Kairi

Kairi is a programming aid for finding divergences between jsdoc comment and function declaration. Kairi(乖離) means divergence in Japanese.
Use ChatGPT to look for divergences.

## Install

Download this repository.

```sh
git clone https://github.com/sa2taka/Kairi
```

## Usage

```sh
OPENAI_API_KEY=<your OpenAI api key> ./bin/index <path to target files...>
```

### Option

```
-V, --version              output the version number
-c, --count                count of target, do not run the ChatGPT (default: false)
-s, --strict               more strict check (default: true)
-l, --language <language>  language of the output (default: "en")
-h, --help                 display help for command
```

## Supported programming language

- JavaScript
- TypeScript

## Example

```typescript:index.ts
/**
 * Add two numbers
 */
export const add = (a: number, b: number) => {
  return a - b;
};

/**
 * Add to the end of the array. Immutable functions
 */
export const addToArray = (array: number[], value: number) => {
  array.push(value);
  return array;
};
```

```sh
$ OPENAI_API_KEY=<openai api key> ./bin/index  -s index.ts
# index.ts:3:0
2: The comment states that the function should add two numbers but the program actually subtracts them.

---

# index.ts:10:0
2: The #Comment describes the behavior of the #Program, but does not specify that the function mutates the original array.
```
