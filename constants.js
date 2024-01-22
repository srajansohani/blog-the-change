export const SHARED_PROMPT = `You are an expert programmer, and you are trying to extensively summarize a git diff.
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

export const BASE_PROMPT = `${SHARED_PROMPT}
The following is a git diff of a every file in a single commit.
Please summarize the changes in each file in bullet points and then generate an extensive summary of the entire commit, describing the changes made in the diff in high level.
Do it in the following way:
Write SUMMARY: and then write a summary of the changes in bullet points for each file after that write a complete extensive summary for the entire commit.
`;

export const ISSUE_PROMPT = `
  Following is the information of the issue resolved by this changes kindly elaborate it in a seprate section called issues resolved
`
