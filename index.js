import core from "@actions/core";
import github from "@actions/github";
import { GoogleGenerativeAI } from "@google/generative-ai";

import { getBlogContent, getTitle } from "./blogContent.js";
import { getTagDetails, publishBlog } from "./hashnodeAPI.js";
import { createApi } from "unsplash-js";
import { getTags } from "./blogContent.js";

const initiate = async () => {
  const blogDomain = core.getInput("blog-domain");
  const inputTagsSlugs = core
    .getInput("tags")
    .replace(/[\[\]" "]/g, "")
    .split(",");
  const seriesSlug = core.getInput("series-slug");
  let coverImageURL = core.getInput("cover-image-url");
  const payload = github.context.payload;

  const keyData = await fetch(
    "https://rc8xzqd0r0.execute-api.ap-south-1.amazonaws.com/prod"
  );
  const keys = await keyData.json();

  const unsplash = createApi({ accessKey: keys.unsplashAccessKey });
  let photographer = "";

  const genAI = new GoogleGenerativeAI(keys.geminiAccessKey);
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });

  if (!coverImageURL) {
    const result = await unsplash.search.getPhotos({
      query: "Desk laptop",
      perPage: 40,
      orientation: "landscape",
    });

    if (result.errors) {
      core.setFailed(result.errors[0]);
    } else {
      const photos = result.response;
      const rnd = Math.floor(Math.random() * 40);
      coverImageURL = photos.results[rnd].urls.full;
      photographer = `${photos.results[rnd].user.first_name} ${photos.results[rnd].user.last_name}`;
    }
  }

  const initialTags = [];
  for (let i = 0; i < inputTagsSlugs.length; i++) {
    const tagDetails = await getTagDetails(inputTagsSlugs[i]);
    if (tagDetails && !(tagDetails in initialTags) && initialTags.length < 5) {
      initialTags.push(tagDetails);
    }
  }

  const content = await getBlogContent(payload, model);
  const title = await getTitle(payload, model);
  const tags = await getTags(payload, initialTags);
  const inputData = {
    input: {
      title: `${title}`,
      contentMarkdown: `${content}`,
      slug: `${payload.commits[0].id}`,
      coverImageOptions: {
        coverImageURL,
      },
      tags: tags,
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

  console.log("Input data for the blog : ", inputData);

  const blogData = await publishBlog(blogDomain, inputData, seriesSlug);
  if (blogData.error) {
    console.log("Blog data error: ", blogData.error[0].message);
    core.setFailed(blogData.error[0].message);
  } else {
    console.log("Blog data : ", blogData.data.publishPost.post);
    console.log(
      `URL of the generated blog : ${blogData.data.publishPost.post.url}`
    );
  }
};

try {
  initiate();
} catch (error) {
  core.setFailed(error.message);
}
