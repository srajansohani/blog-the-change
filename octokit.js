import { Octokit } from "@octokit/rest";

const octokit = new Octokit({
  auth: process.env.GITHUB_ACCESS_TOKEN,
});

export default { octokit };
