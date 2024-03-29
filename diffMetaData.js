import { octokit } from "./octokit.js";

const getDiffData = async (payload) => {
  const repository = payload.repository;
  const owner = repository.owner.login;
  const repo = repository.name;
  const commitSha = payload.after;
  const commit = await octokit.repos.getCommit({
    owner,
    repo,
    ref: commitSha,
  });
  const parentCommitSha = payload.before;
  if (payload.before === "0000000000000000000000000000000000000000") {
    return commit.data.files;
  }
  const commitDiff = await octokit.repos.compareCommits({
    owner,
    repo,
    base: parentCommitSha,
    head: commitSha,
  });
  return commitDiff.data.files;
};

export { getDiffData };
