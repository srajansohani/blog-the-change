export const SHARED_PROMPT = `You are an expert programmer, and you are trying to summarize a git diff.
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
The following is a git diff of a single file.
Please summarize it in a comment, describing the changes made in the diff in high level.
Do it in the following way:
Write SUMMARY: and then write a summary of the changes made in the diff, as a bullet point list.
Every bullet point should start with a *.
`