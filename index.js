import core from "@actions/core";
import github from "@actions/github";
import { octokit } from "./octokit.js";



const getDiffData = async(payload)=>{
  const repository = payload.repository;
  const owner = repository.owner.login;
  const repo = repository.name;
  const commitSha = payload.after;
  const commit = await octokit.repos.getCommit({
    owner,
    repo,
    ref: commitSha,
  });
  const parentCommitSha = commit.data.parents[0].sha;
  const commitDiff = await octokit.repos.compareCommits({
    owner,
    repo,
    base: parentCommitSha,
    head: commitSha,
  });

  return commitDiff;
}

const getPublicationID = async (blogDomain) => {
  let response = await fetch("https://gql.hashnode.com/", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      query: `
        query Publication {
            publication(host: "${blogDomain}") {
                id
            }
        }
      `,
    }),
  });

  let responseData = await response.json();
  console.log(responseData);
  return responseData.data.publication.id;
};

const postBlog = async (blogDomain, inputData, accessToken) => {
  try {
    const publicationID = await getPublicationID(blogDomain);
    console.log(`Publication id ${publicationID}`);

    inputData.input.publicationId = publicationID;

    console.log(`input data with publication ID ${inputData}`);
    let response = await fetch("https://gql.hashnode.com/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },

      body: JSON.stringify({
        query: `
        mutation PublishPost($input: PublishPostInput!) {
          publishPost(input: $input) {
            post {
              id
              title
              subtitle
              url
            }
          }
        }
      `,
        variables: inputData,
      }),
    });

    const responseData = await response.json();
    console.log(responseData);
  } catch (err) {
    console.log(err);
  }
};

try {
  const blogDomain = core.getInput("blog-domain");
  console.log(`Given blog domain ${blogDomain}!`);

  const payload = github.context.payload;
  const commitDiff = getDiffData(payload);
  const diffData =  JSON.stringify(commitDiff.data.files[0].patch);

  const inputData = {
    input: {
      title: `${payload.commits[0].message} in ${payload.repository.full_name} (${payload.commits[0].id})`,
      contentMarkdown: `commit URL ${payload.commits[0].url} \n by ${payload.commits[0].author.name} \n the difference of code is \n ${diffData}`,
      tags: [],
    },
  };

  console.log(`Blog input data ${inputData}`);

  const accessToken = process.env.HASHNODE_ACCESS_TOKEN;
  console.log(`Hashnode access token ${accessToken}`);

  postBlog(blogDomain, inputData, accessToken);
} catch (error) {
  core.setFailed(error.message);
}
