import core from "@actions/core";
import github from "@actions/github";

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

const postBlog = async (inputData, accessToken) => {
  try {
    const publicationID = await getPublicationID(blogDomain);
    console.log(`Publication id ${publicationID}`);

    inputData.publication = publicationID;

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

  const payload = JSON.stringify(github.context.payload, undefined, 2);
  console.log(`The event payload: ${payload}`);

  const inputData = {
    input: {
      //   title: `${payload.commits[0].message} in ${payload.repository.full_name}`,
      title: `test blog via github actions`,
      //   contentMarkdown: `commit URL ${payload.commits[0].url} \n by ${payload.commits[0].author.name}`,
      contentMarkdown: `test blog using github actions`,
      tags: [],
    },
  };
  console.log(`Blog input data ${inputData}`);

  const accessToken = process.env.HASHNODE_ACCESS_TOKEN;
  console.log(`Hashnode access token ${accessToken}`);

  postBlog(inputData, accessToken);
} catch (error) {
  core.setFailed(error.message);
}
