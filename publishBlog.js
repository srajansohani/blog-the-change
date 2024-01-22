import core from "@actions/core";

const getPublicationID = async (blogDomain) => {
  try {
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
    return responseData.data.publication.id;
  } catch (error) {
    core.setFailed(error.message);
  }
};

const getSerieseID = async () => {};

const publishBlog = async (blogDomain, inputData) => {
  try {
    const publicationID = await getPublicationID(blogDomain);
    inputData.input.publicationId = publicationID;

    let response = await fetch("https://gql.hashnode.com/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        Authorization: process.env.HASHNODE_ACCESS_TOKEN,
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
    console.log(
      `URL of the generated blog : ${responseData.data.publishPost.url}`
    );
  } catch (error) {
    core.setFailed(error.message);
  }
};

export default publishBlog;
