import getDiffData from "./diffMetaData.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT, ISSUE_PROMPT } from "./constants.js";
import { getIssues } from "./ExtractIssue.js";

const summarize = async (payload) => {
  const diffFiles = await getDiffData(payload);
  let prompt = BASE_PROMPT;

  diffFiles.map((file) => {
    const message = `The git diff of ${file.filename} is :`;
    const diffSummary = JSON.stringify(file.patch);
    prompt += message + "\n" + diffSummary + "\n";
  });
  prompt = prompt + "\n" + ISSUE_PROMPT;
  const issues = await getIssues(payload);

  issues.map((issue, index) => {
    const issuePrompt = `\n Issue ${index + 1} \n title : ${
      issue.title
    } \n description : ${issue.body}`;

    prompt = prompt + issuePrompt;
  });

  const geminiAPIKey = process.env.GEMINI_API_KEY;
  const genAI = new GoogleGenerativeAI(geminiAPIKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();
  return content;
};

export default summarize;
