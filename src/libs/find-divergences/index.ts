import console from "console";
import { Result } from "../common/models/result";
import { Target } from "../common/models/target";
import { Configuration, OpenAIApi } from "openai";
import { getOption } from "../../global-option";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});

const openai = new OpenAIApi(configuration);

const promptTemplate = (target: Target) => {
  const { language } = getOption();
  return `Please do the following about #Comment and #Program. #Comment is description of #Program
- Please rate on a scale of 1 to 3 whether #Comment and #Program are an exact match.
    - 3: Perfectly matched
    - 2: #Program does something that is not present in #Comment. Or #Comment states something that is not present in #Program.
    - 1: No match at all
- If the rate is less than 3, please also reason why.
- If the rate is less than 3, please suggest an appropriate comment
    - the comment should be proposed by removing the syntax of the program comments.
- Please output the content according to the #Format(json).
- Please output in ${language} language. 

#Comment
${target.comment}

#Program
${target.program}

#Format
{
  "rate": <rate of the confidence>,
  "reason": <reason of the rate in ${language} language>,
  "suggest": <the appropriate comment of your suggestion or null in ${language} language>
}
`;
};

const isResult = (json: unknown): json is Result => {
  return Boolean(
    json &&
      typeof json === "object" &&
      "rate" in json &&
      typeof json.rate === "number" &&
      "reason" in json &&
      "suggest" in json
  );
};

export const findDivergences = async (
  target: Target
): Promise<Result | null> => {
  const prompt = promptTemplate(target);
  let response;
  try {
    response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });
  } catch (e) {
    console.warn(`failed chat: ${target.filepath}`);
    if (e instanceof Error) {
      console.error((e as any).response.data);
    }

    return null;
  }

  const { choices } = response.data;
  const reply = choices[0]?.message?.content;

  try {
    if (!reply) {
      throw new Error("reply is empty");
    }
    const json = JSON.parse(reply);

    if (!isResult(json)) {
      throw new Error("result different format");
    }

    return json;
  } catch (e) {
    console.warn(`failed parse json: ${target.filepath}`);
    console.warn(`reply content: ${reply}}`);
    return null;
  }
};
