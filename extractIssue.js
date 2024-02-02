import { octokit } from "./octokit.js";

const extractNumbers = (inputString) => {
  let pattern = /#(\d+)/g;
  let matches = inputString.match(pattern);
  if (matches) {
    let numbers = matches.map(function (match) {
      return parseInt(match.slice(1), 10);
    });
    return numbers;
  } else {
    return [];
  }
};

const getIssues = async (payload) => {
  const commitMessage = payload.head_commit.message;
  const issueNumbers = extractNumbers(commitMessage);
  const repository = payload.repository;
  const owner = repository.owner.login;
  let issues = [];
  for (let i = 0; i < issueNumbers.length; i++) {
    const issue = await octokit.rest.issues.get({
      owner: owner,
      repo: repository.name,
      issue_number: issueNumbers[i],
    });
    issues.push(issue.data);
  }
  return issues;
};

export { getIssues };
