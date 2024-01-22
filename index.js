import core from "@actions/core";
import github from "@actions/github";
import summarize from "./summarize.js";
import publishBlog from "./publishBlog.js";
import { createApi } from "unsplash-js";

try {
  const blogDomain = core.getInput("blog-domain");
  const seriesSlug = core.getInput("series-slug");
  const coverImageURL = core.getInput("cover-image-url");
  const payload = github.context.payload;

  const unsplash = createApi({
    accessKey: process.env.unsplash_ACCESS_KEY,
  });

  console.log("initail URL ", coverImageURL);

  if (!coverImageURL) {
    unsplash.search
      .getPhotos({ query: "Desk", perPage: 1, orientation: "landscape" })
      .then((result) => {
        if (result.errors) {
          console.log("error occurred: ", result.errors[0]);
        } else {
          const photo = result.response;
          console.log("img URL ", photo.results[0].urls.full);
          coverImageURL = photo.results[0].urls.full;
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

      publishBlog(blogDomain, inputData, seriesSlug);
    })
    .catch((error) => {
      core.setFailed(error.message);
    });
} catch (error) {
  core.setFailed(error.message);
}
