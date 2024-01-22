import core from "@actions/core";
import github from "@actions/github";
import summarize from "./summarize.js";
import publishBlog from "./publishBlog.js";
import { createApi } from "unsplash-js";

try {
  const blogDomain = core.getInput("blog-domain");
  const seriesSlug = core.getInput("series-slug");
  let coverImageURL = core.getInput("cover-image-url");
  const payload = github.context.payload;

  const unsplash = createApi({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
  });

  console.log("initail URL ", coverImageURL);

  let photographer = "";

  if (!coverImageURL) {
    unsplash.search
      .getPhotos({
        query: "Desk laptop",
        perPage: 20,
        orientation: "landscape",
      })
      .then((result) => {
        if (result.errors) {
          console.log("error occurred: ", result.errors[0]);
        } else {
          const photo = result.response;
          const rnd = Math.floor(Math.random() * 19);
          console.log("img URL ", photo.results[rnd].urls.full);
          coverImageURL = photo.results[rnd].urls.full;
          photographer = `${photo.results[rnd].user.first_name} ${photo.results[rnd].user.last_name}`;
        }
      });
  }

  summarize(payload)
    .then((content) => {
      const inputData = {
        input: {
          title: `${payload.commits[0].message} in ${payload.repository.full_name} (${payload.commits[0].id})`,
          contentMarkdown: `${content}`,
          tags: [],
          coverImageOptions: {
            coverImageURL,
          },
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

      publishBlog(blogDomain, inputData, seriesSlug);
    })
    .catch((error) => {
      core.setFailed(error.message);
    });
} catch (error) {
  core.setFailed(error.message);
}
