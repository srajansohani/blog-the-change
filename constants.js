const INITIAL_EXPLANATION_PROMPT = `
You are an expert programmer, and you are trying to understand a git diff
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
The git diff of lib/index.js is :
- const a=1;
+ const b=1;
\`\`\`
This means that in \`lib/index.js\` line "const a=1;" was deleted and the line "constb=1;" was added in this commit. 
Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line starting with \`-\` means that the line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding. 
It is not part of the diff.

Additionally, being an expert programmer, we should not add any information that was not provided to you as the integrity of the blog is extremely important.

`;

const TITLE_PROMPT = `
${INITIAL_EXPLANATION_PROMPT}
Do the following operations:
Generate a very short title of 5 to 6 words in plain text describing the changes made in the git diff and nothing else.
Only consider the changes given in the git diff and do not add any additional information.
The following is the git diff of every file in a single commit.

`;

const OVERVIEW_PROMPT = `
${INITIAL_EXPLANATION_PROMPT}
Do the following operations:
Write "# Overview" and then write a short summary in plain text without using special characters describing the high level changes made in the diff and nothing else.
The following is the git diff of every file in a single commit.

`;

const FILE_SUMMARY_PROMPT = `
${INITIAL_EXPLANATION_PROMPT}
Do the following operations:
Write "# File wise changes made" and for each file,
write "### " name of the file followed by the summary of the changes made in only a few points. Each point must start with "- ".
The following is the git diff of every file in a single commit.

`;

const ISSUE_PROMPT = `
Do the following operations:
Write "# Related issue" and for each issue provided,
write "### " name of the issue followed by the issue description and how is it resolved by referencing the coe in the git diff in separate paragraphs.
Following is the information of the issues resolved by this change and remember to only talk about the issue provided below and nothing else.

`;

const FINAL_SUMMARY_PROMPT = `
${INITIAL_EXPLANATION_PROMPT}
Do the following operations:
Write "# Summary" and generate an extensive summary of the changes made in plain text wihout using special characters and nothing else.
The following is the git diff of every file in a single commit.

`;

const FILE_TYPE_TO_SLUG = {
  js: "javascript",
  yml: "yaml",
  cpp: "cpp",
  py: "python",
  css: "css",
  java: "java",
  ts: "typescript",
  xml: "xml",
  dockerfile: "docker",
};

export default {
  INITIAL_EXPLANATION_PROMPT,
  TITLE_PROMPT,
  OVERVIEW_PROMPT,
  FILE_SUMMARY_PROMPT,
  ISSUE_PROMPT,
  FINAL_SUMMARY_PROMPT,
  FILE_TYPE_TO_SLUG,
};
