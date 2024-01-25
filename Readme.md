# commit-blog-generator

The `commit-blog-generator` GitHub Action is a powerful tool that utilizes the capabilities of Google Gemini's large language model to produce blog summaries of the changes introduced by a commit in a repository on [Hashnode](https://hashnode.com/). By generating the git diff for each commit and each modified file and sending it to the Gemini API with a carefully crafted prompt, the action can produce and post concise and informative summaries in a blog that greatly enhance the understanding of anyone who reads it and also helps the user or owner document their work.

## Getting Started

### Setting up

**Step 1: Setup Hashnode Account and Add ACCESS KEY AS SECRET**

1. Once you are registered on Hashnode, go to [Hashnode](https://hashnode.com).
2. Click on the User Icon and go to Account Settings.
   ![image setting](https://ibb.co/xCtN8Tq)
3. Click on Developer and generate a new token, then copy it.
4. Now go to your repository page and go to Settings.
   ![https://ibb.co/3p37Ny9]
5. Click on Secret and Variable dropdown and click on Actions.
   ![https://ibb.co/3p37Ny9]
6. Scroll down and click on Add new repository secret.
7. Add Name as `HASHNODE_ACCESS_TOKEN` and paste the copied token in the secret section, then click Add Secret.

**Step 2: Add GEMINI ACCESS KEY AS SECRET**

For the action to be able to generate summaries, it will require a Gemini access key. To generate and add the access key, follow these steps:

1. Go to [GEMINII AI](https://makersuite.google.com/app/apikey).
2. Click on Create API key if not already created, else use the created one and click copy.
   ![https://ibb.co/cJnYMsp]
3. Now go to your repository page and go to Settings.
4. Click on Secret and Variable dropdown and click on Actions.
5. Scroll down and click on Add new repository secret.
6. Add Name as `GEMINI_API_KEY` and paste the copied key in the secret section, then click Add Secret.

**Step 3: Create your SubDomain on Hashnode**

You will need a domain on Hashnode where your blogs will be generated. To create a domain on Hashnode, follow these steps:

1. Go to [Hashnode](https://hashnode.com/) and click on the user icon, then click start a personal blog.
2. Now select any subdomain name you want and click create.
3. Now use this blog domain in the workflow file as input discussed ahead.

Or, if you already have a domain, it will be visible on clicking the user icon.

**Step 4: Create a Series for the Summary blogs of the repository (Optional)**

When you create a series on Hashnode, you can link multiple posts together, and readers can navigate through the series to explore the content in a structured and sequential manner. So, it is recommended to create a separate series for the blogs generated for your repo. To create a series on Hashnode:

1. Go to [Hashnode](https://hashnode.com/) and click on the user icon, then hover over Personal Blog, and click on series as shown.
   ![https://ibb.co/61D1Zv8]

**Step 4: Add Workflow File in your repository**

Next, you will need to add the workflow file to your repository. Create a file named `.github/workflows/gpt-commit-summarizer.yml` (relative to the git root folder) and copy the following code into it:

```yaml
on: [push]

jobs:
  blog-generation-job:
    runs-on: ubuntu-latest
    name: Automatic blog generation
    steps:
      - name: Commit Blog Generator
        uses: srajansohani/commit-blog-generator@v0.32
        with:
          blog-domain: 'Your-Blog-Domain'
        env:
          HASHNODE_ACCESS_TOKEN: ${{ secrets.HASHNODE_ACCESS_TOKEN }}
          GITHUB_ACCESS_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}
```

 This workflow file tells GitHub to run the action whenever a new Commit is pushed on the repo or a pr is merged.
    That's it! You're now ready to use the commit-blog generator action in your repository. Each time a pull request is merged or a commit is pushed, the action will automatically publish a blog on hashnnode that will contain the  summary of the changes made in commit.


## Encountered any bugs?

    If you encounter any bugs or have any suggestions for improvements, please open an issue on the repository. Alternatively, you can contact me at my [email][srajasohani999@gmail.com].

## LICENSE

The Project is Under [MIT LICENSE][https://github.com/srajansohani/commit-blog-generator?tab=MIT-1-ov-file]

