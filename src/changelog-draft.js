
const parse = require('parse-github-url');
const getRemoteUrl = require('../src/git-remote-url');
const getChangelogPullRequests = require('../src/get-changelog-pull-requests');
const {parseEntriesFromPullRequests, categorizeEntries} = require('../src/parse-and-categorize-changelog-entries');
const renderSections = require('../src/render');

module.exports = async function(octokit, {repo: githubRepo, current, previous, format}) {
    const url = await getRemoteUrl();
    const {owner, name: repo} = parse(githubRepo || url);
    previous = previous || (await octokit.repos.getLatestRelease({repo, owner})).data.tag_name;

    console.error(`Changes: ${owner}/${repo} ${previous}...${current}`);

    const pullRequests = await getChangelogPullRequests(octokit, {repo, owner, previous, current});
    const entries = parseEntriesFromPullRequests(pullRequests);
    const sections = categorizeEntries(entries);

    console.error(`\nFound ${sections.skip.entries.length} Pull Requests that skip changelogs.\n`);
    const header = `
Current: [${current}](${process.env.GITHUB_BASE_URL}/${owner}/${repo}/releases/tag/${current})
Previous: [${previous}](${process.env.GITHUB_BASE_URL}/${owner}/${repo}/releases/tag/${previous})
Compare: [${previous}...${current}](${process.env.GITHUB_BASE_URL}/${owner}/${repo}/compare/${previous}...${current})

`;
    const formattedSections = renderSections(sections, format);

    return header + formattedSections;
};