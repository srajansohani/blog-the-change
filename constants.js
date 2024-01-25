export const INITIAL_EXPLANATION_PROMPT = `You are an expert programmer, and you are trying to extensively summarize a git diff.
Reminders about the git diff format:
For every file, there are a few metadata lines, like (for example):
\`\`\`
diff --git a/lib/index.js b/lib/index.js
index aadf691..bfef603 100644
--- a/lib/index.js
+++ b/lib/index.js
\`\`\`
This means that \`lib/index.js\` was modified in this commit. Note that this is only an example.
Then there is a specifier of the lines that were modified.
A line starting with \`+\` means it was added.
A line that starting with \`-\` means that line was deleted.
A line that starts with neither \`+\` nor \`-\` is code given for context and better understanding. 
It is not part of the diff.
`;

export const BASE_PROMPT = `${INITIAL_EXPLANATION_PROMPT}
The following is the git diff of a every file in a single commit.
Please summarize the changes in each file and then generate an summary of the entire commit.
Do it in the following way:
First write "Title" the write a very short title describing the entire summary then write $% after that,
Write "# Overview" and then write a short summary describing the changes made in the diff in high level.
Write "# File wise changes made" and for each file,
write "### " name of the file followed by the summary of the changes made in points. Each point must start with "- ".
`;

export const ISSUE_PROMPT = `
Write "# Related issue" and for each issue provided,
write "### " name of the issue followed by the issue description and how is it resolved in seperate paragraphs.
Following is the information of the issue resolved by this change.
`;

export const FINAL_SUMMARY_PROMPT = `
Finally write "# Summary" and generate a extensive summary of the changes made.
`;

export const TITLE_PROMPT = `${INITIAL_EXPLANATION_PROMPT}
The following is the git diff of a every file in a single commit.
Please summarize the changes in each file and then generate an summary of the entire commit.
Do it in the following way:
Write a very short title describing the entire summary.
`;
