export type Option = {
  count: boolean;
  strict: boolean;
  language: string;
};

let option: Option = {
  count: false,
  strict: false,
  language: "en",
};

export const setOption = (newOption: Partial<Option>) => {
  option = { ...option, ...newOption };
};

export const getOption = (): Option => {
  return option;
};
