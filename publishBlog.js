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

const getSerieseID = async (blogDomain, seriesSlug) => {
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
                    series(slug: "${seriesSlug}") {
                        id
                    }
                }
            }
        `,
      }),
    });

    let responseData = await response.json();
    return responseData.data.publication.series.id;
  } catch (error) {
    core.setFailed(error.message);
  }
};
export const getTagDetails = async(tagSlug)=>{
  try {
    let response = await fetch("https://gql.hashnode.com/", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        query: `
            query Tag {
                tag(slug: "${tagSlug}") {
                    id,
                    name,
                    slug,
                }
            }
        `,
      }),
    });

    let responseData = await response.json();
    console.log(responseData.data.tag);
    return responseData.data.tag;
  }
  catch(error){
    core.setFailed(error.message);
  }
}

const publishBlog = async (blogDomain, inputData, seriesSlug = undefined) => {
  try {
    const publicationID = await getPublicationID(blogDomain);
    inputData.input.publicationId = publicationID;

    if (seriesSlug) {
      const seriesID = await getSerieseID(blogDomain, seriesSlug);
      inputData.input.seriesId = seriesID;
    }

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
              tags{
                name
              }
            }
          }
        }
      `,
        variables: inputData,
      }),
    });

    const responseData = await response.json();
    return responseData;
  } catch (error) {
    core.setFailed(error.message);
  }
};

export default publishBlog;
