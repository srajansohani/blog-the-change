import core from "@actions/core";
import github from "@actions/github";
import summarize from "./summarize.js";
import publishBlog from "./publishBlog.js";

try {
  const blogDomain = core.getInput("blog-domain");
  const payload = github.context.payload;

  summarize(payload)
    .then((content) => {
      const inputData = {
        input: {
          title: `${payload.commits[0].message} in ${payload.repository.full_name} (${payload.commits[0].id})`,
          contentMarkdown: `${content}`,
          tags: [],
        },
      };

      publishBlog(blogDomain, inputData);
    })
    .catch((error) => {
      core.setFailed(error.message);
    });
} catch (error) {
  core.setFailed(error.message);
}
