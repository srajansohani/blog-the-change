import core from "@actions/core";
import github from "@actions/github";
import { summarize, getTitle } from "./summarize.js";
import publishBlog from "./publishBlog.js";
import { createApi } from "unsplash-js";
import { getTags } from "./summarize.js";

const initiate = async () => {
  const blogDomain = core.getInput("blog-domain");
  const seriesSlug = core.getInput("series-slug");
  let coverImageURL = core.getInput("cover-image-url");
  const payload = github.context.payload;

  const res = await fetch(
    "https://3t4q6lf0rk.execute-api.ap-south-1.amazonaws.com/prod"
  );

  const keys = await res.json();

  const unsplash = createApi({ accessKey: keys.unsplashAccessKey });

  let photographer = "";

  if (!coverImageURL) {
    const result = await unsplash.search.getPhotos({
      query: "Desk laptop",
      perPage: 20,
      orientation: "landscape",
    });

    if (result.errors) {
      core.setFailed(result.errors[0]);
    } else {
      const photo = result.response;
      const rnd = Math.floor(Math.random() * 19);
      coverImageURL = photo.results[rnd].urls.full;
      photographer = `${photo.results[rnd].user.first_name} ${photo.results[rnd].user.last_name}`;
    }
  }

  const content = await summarize(payload);
  const title = await getTitle(payload);
  const tags = await getTags(payload);
  const inputData = {
    input: {
      title: `${title}`,
      // subtitle: `Commit URL ${payload.compare}`,
      contentMarkdown: `${content}`,
      slug: `${payload.commits[0].id}`,
      coverImageOptions: {
        coverImageURL,
      },
      tags: tags
    },
  };
  
  if (photographer.length) {
    inputData.input.coverImageOptions = {
      coverImageURL,
      isCoverAttributionHidden: false,
      coverImagePhotographer: photographer,
      coverImageAttribution: `Image was posted by ${photographer} on Unsplash`,
    };
  }

  const blogData = await publishBlog(blogDomain, inputData, seriesSlug);
  console.log("Blog data : ", blogData);
  if (blogData?.error) {
    console.log("blog data error: ", blogData?.error[0]?.message);
  }
  console.log(
    `URL of the generated blog : ${blogData.data.publishPost.post.url}`
  );
};

try {
  initiate();
} catch (error) {
  core.setFailed(error.message);
}
