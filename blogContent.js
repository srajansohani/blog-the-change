import { getDiffData } from "./diffMetaData.js";
import {
  INITIAL_EXPLANATION_PROMPT,
  TITLE_PROMPT,
  OVERVIEW_PROMPT,
  FILE_SUMMARY_PROMPT,
  FINAL_SUMMARY_PROMPT,
  ISSUE_PROMPT,
  FILE_TYPE_TO_SLUG,
} from "./constants.js";
import { getIssues } from "./extractIssue.js";
import { getTagDetails } from "./hashnodeAPI.js";

const getTags = async (payload, tags = []) => {
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
    if (FILE_TYPE_TO_SLUG.hasOwnProperty(type)) {
      const tagData = await getTagDetails(FILE_TYPE_TO_SLUG[type]);
      if (tagData) {
        const tag = {
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
        };
        if (!(tag in tags) && tags.length < 5) {
          tags.push(tag);
        }
      }
    }
  }
  return tags;
};

const getBlogContent = async (payload, model) => {
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
    const result = await model.generateContent(sectionalPrompts[i]);
    const response = result.response;
    const sectionContent = response.text();
    content += "\n" + sectionContent + "\n";
  }

  return content;
};

const getTitle = async (payload, model) => {
  const diffFiles = await getDiffData(payload);
  let prompt = TITLE_PROMPT;

  diffFiles.map((file) => {
    const message = `The git diff of ${file.filename} is :`;
    const diffSummary = JSON.stringify(file.patch);
    prompt += message + "\n" + diffSummary + "\n";
  });

  const result = await model.generateContent(prompt);
  const response = result.response;
  const content = response.text();
  return content;
};

export default { getTags, getBlogContent, getTitle };
