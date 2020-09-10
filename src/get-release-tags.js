const parse = require('parse-github-url');
const getRemoteUrl = require('../src/git-remote-url');

module.exports = async function getReleaseTags(octokit, {repo: githubRepo, per_page}) {
    const {owner, name: repo} = parse(githubRepo || await getRemoteUrl());
    const releases = await octokit.repos.listReleases({repo, owner, per_page});
    return releases.data.map((rel) => ({ tag: rel.tag_name, name: rel.name, created_at: rel.created_at }));
};
