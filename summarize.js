import getDiffData from "./diffMetaData";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { BASE_PROMPT } from "./constants.js";

const summarize = async (payload) => {
  const diffFiles = await getDiffData(payload);
  let prompt = BASE_PROMPT;

  diffFiles.map((file) => {
    const message = `THE GIT DIFF OF ${file.filename} TO BE SUMMARIZED:`;
    const diffSummary = JSON.stringify(file.patch);
    prompt += message + "\n" + diffSummary + "\n";
  });

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();
  return content;
};

export default summarize;
