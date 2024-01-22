import { octokit } from "./octokit.js";

function extractNumbers(inputString) {
    var pattern = /#(\d+)/g;
    var matches = inputString.match(pattern);
    if (matches) {
        var numbers = matches.map(function(match) {
            return parseInt(match.slice(1), 10);
        });
        return numbers;
    } else {
        return [];
    }
}

export const getIssues = async(payload)=>{
    const commitMessage = payload.head_commit.message;
    const issueNumbers = extractNumbers(commitMessage);
    const repository = payload.repository;
    const owner = repository.owner.login;
    console.log(issueNumbers);
    let issues = [];
    for(let i = 0; i < issueNumbers.length; i++) {
        const issue = await octokit.rest.issues.get({
            owner: owner,
            repo: repository.name,
            issue_number: issueNumbers[i]
        })
        issues.push(issue.data);
        console.log(issue.data);
    }
    console.log(issues);
    return issues;
}



