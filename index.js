import core from "@actions/core";
import github from "@actions/github";
import { octokit } from "./octokit.js";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { BASE_PROMPT} from "./constants.js"


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
  const parentCommitSha = payload.before;
  const commitDiff = await octokit.repos.compareCommits({
    owner,
    repo,
    base: parentCommitSha,
    head: commitSha,
  });

  return commitDiff.data.files;
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

const getSummary = async (prompt, geminiAPIKey) => {
  const genAI = new GoogleGenerativeAI(geminiAPIKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  const result = await model.generateContent(prompt);
  const response = await result.response;
  const text = response.text();
  console.log(`Summary generated ${text}`);
  return text;
};

try {
  const blogDomain = core.getInput("blog-domain");
  console.log(`Given blog domain ${blogDomain}!`);

  const payload = github.context.payload;
  let diffData = "";

  getDiffData(payload)
    .then(async (result) => {
      const files  = result;
      let finalPrompt = BASE_PROMPT;
      files.map((file)=>{
          const message = `THE GIT DIFF OF ${file.filename} TO BE SUMMARIZED:`
          const diff = JSON.stringify(file.patch);
          finalPrompt = finalPrompt + message + '\n' + diff + '\n';
      })
      console.log(finalPrompt);

      const geminiAPIKey = process.env.GEMINI_API_KEY;
      const content = await getSummary(finalPrompt, geminiAPIKey);

      const inputData = {
        input: {
          title: `${payload.commits[0].message} in ${payload.repository.full_name} (${payload.commits[0].id})`,
          contentMarkdown: `${content}`,
          tags: [],
        },
      };

      console.log(`Blog input data ${inputData}`);

      const accessToken = process.env.HASHNODE_ACCESS_TOKEN;
      console.log(`Hashnode access token ${accessToken}`);

      postBlog(blogDomain, inputData, accessToken);
    })
    .catch((error) => {
      console.error("Error:", error);
    });
} catch (error) {
  core.setFailed(error.message);
}
