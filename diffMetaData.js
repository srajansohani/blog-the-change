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
  const parentCommitSha = (payload.before !== "0000000000000000000000000000000000000000") ? payload.before : '4b825dc642cb6eb9a060e54bf8d69288fbee4904';
  const commitDiff = await octokit.repos.compareCommits({
    owner,
    repo,
    base: parentCommitSha,
    head: commitSha,
  });

  return commitDiff.data.files;
};

export default getDiffData;
