const ciInfo = require('ci-info');

const ref = process.env.BRANCH_NAME;
const branch = ref ? ref.split('/').pop() : 'main';

const changelogSuffix = branch !== 'main' ? `-${branch}` : '';
const changelogName = `CHANGELOG${changelogSuffix}.md`;

console.log(`Branch name: ${branch}`);
console.log(`Changelog name: ${changelogName}`);
console.log(`Running from CI: ${ciInfo.isCI}`);

const cfg = {
  branches: [
    '+([0-9])?(.{+([0-9]),x}).x',
    'main',
    'next',
    {
      name: 'beta',
      prerelease: 'beta',
    },
    {
      name: 'alpha',
      prerelease: 'alpha',
    },
  ],
  tagFormat: '${version}',
  plugins: [
    [
      '@semantic-release/commit-analyzer',
      {
        preset: 'angular',
      },
    ],
    '@semantic-release/release-notes-generator',
    [
      '@semantic-release/changelog',
      {
        changelogFile: `${changelogName}`,
      },
    ],
    [
      '@semantic-release/npm',
      {
        npmPublish: false,
      },
    ],
    [
      '@semantic-release/exec',
      {
        publishCmd: 'pnpm run release:publish',
      },
    ],
    [
      '@semantic-release/git',
      {
        assets: ['docs', 'CHANGELOG*.md', 'package.json'],
        message:
          'chore(release): ${nextRelease.version} [skip ci]\n\n${nextRelease.notes}',
      },
    ],
  ],
};

if (ciInfo.isCI) {
  cfg.plugins.push([
    '@semantic-release/github',
    {
      assets: 'dist/index.user.js',
    },
  ]);
}

module.exports = cfg;
