import getDiffData from "./diffMetaData.js";
import {
  INITIAL_EXPLANATION_PROMPT,
  TITLE_PROMPT,
  OVERVIEW_PROMPT,
  FILE_SUMMARY_PROMPT,
  FINAL_SUMMARY_PROMPT,
  ISSUE_PROMPT,
  fileTypeToSlug,
} from "./constants.js";
import { getIssues } from "./extractIssue.js";
import { getTagDetails } from "./publishBlog.js";

export const getTags = async (payload) => {
  let tags = [];

  const extractFileType = (fileName) => {
    const lastDotIndex = fileName.lastIndexOf(".");
    if (lastDotIndex === -1) {
      return "";
    }
    return fileName.substring(lastDotIndex + 1);
  };

  const diffFiles = await getDiffData(payload);
  for (let i = 0; i < diffFiles.length; i++) {
    const type = extractFileType(diffFiles[i].filename);
    if (fileTypeToSlug.hasOwnProperty(type)) {
      const tagData = await getTagDetails(fileTypeToSlug[type]);
      if (tagData) {
        const tag = {
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
        };
        if (!(tag in tags)) {
          tags.push(tag);
        }
      }
    }
  }
  return tags;
};

export const summarize = async (payload, model) => {
  let gitDiffDetails = "";

  const diffFiles = await getDiffData(payload);
  diffFiles.map((file) => {
    const message = `The git diff of ${file.filename} is :`;
    const diffSummary = JSON.stringify(file.patch);
    gitDiffDetails += message + "\n" + diffSummary + "\n";
  });

  let issuesDetails = "";

  const issues = await getIssues(payload);
  issues.map((issue, index) => {
    const issuePrompt = `Issue ${index + 1} \nTitle : ${
      issue.title
    } \nDescription : ${issue.body}\n`;
    issuesDetails += issuePrompt;
  });

  let content = "";
  const sectionalPrompts = [
    OVERVIEW_PROMPT + gitDiffDetails,
    FILE_SUMMARY_PROMPT + gitDiffDetails,
  ];
  if (issues.length > 0) {
    sectionalPrompts.push(
      INITIAL_EXPLANATION_PROMPT +
        "The following is the git diff of a every file in a single commit." +
        gitDiffDetails +
        ISSUE_PROMPT +
        issuesDetails
    );
  }
  sectionalPrompts.push(FINAL_SUMMARY_PROMPT + gitDiffDetails);

  for (let i = 0; i < sectionalPrompts.length; i++) {
    console.log(sectionalPrompts[i], "\n\n");
    const result = await model.generateContent(sectionalPrompts[i]);
    const response = result.response;
    const sectionContent = response.text();
    console.log("Sectional content : ", sectionContent, "\n\n");
    content += "\n" + sectionContent + "\n";
  }

  console.log("Blog content : ", content, "\n\n");
  return content;
};

export const getTitle = async (payload, model) => {
  const diffFiles = await getDiffData(payload);
  let prompt = TITLE_PROMPT;

  diffFiles.map((file) => {
    const message = `The git diff of ${file.filename} is :`;
    const diffSummary = JSON.stringify(file.patch);
    prompt += message + "\n" + diffSummary + "\n";
  });

  console.log("Gemini title prompt : ", prompt, "\n\n");

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();
  console.log("Blog title : ", content, "\n\n");
  return content;
};
