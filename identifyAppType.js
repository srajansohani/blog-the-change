import { octokit } from "./octokit.js";
import { getTagDetails } from "./hashnodeAPI.js";
import { FILE_TYPE_TO_SLUG } from "./constants.js";

const getPackageJSON = async(owner,repo)=>{
    try {
        const response = await octokit.repos.getContent({
            owner: owner,
            repo: repo,
            path: 'package.json',
        });
        
        if (response.status === 404) {
            return {};
        }

        const content = Buffer.from(response.data.content, 'base64').toString('utf-8');
        const packageJSON = JSON.parse(content);
        return packageJSON;
    } catch (error) {
        return {};
    }
}
const addReactTag = async(payload,tags)=>{
  const packageJSON = await getPackageJSON(payload.repository.owner.login,payload.repository.name);
  if(packageJSON?.dependencies.hasOwnProperty('react') || packageJSON?.dependencies.hasOwnProperty('react-dom') ||packageJSON?.dependencies.hasOwnProperty('react-scripts')   ){
        const tagData = await getTagDetails(FILE_TYPE_TO_SLUG['react']);
        tags.push({
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
        })
  }
  return tags;
}

const addNextTag = async(payload,tags)=>{
    const packageJSON = await getPackageJSON(payload.repository.owner.login,payload.repository.name);
    if(packageJSON?.dependencies.hasOwnProperty('next')){
        const tagData = await getTagDetails(FILE_TYPE_TO_SLUG['next']);
        tags.push({
          id: tagData.id,
          name: tagData.name,
          slug: tagData.slug,
        })
    }
    return tags;
}

export {getPackageJSON,addReactTag,addNextTag}