# NPM package template

## Development

- Install dependencies: `yarn`
- Run development server + build package on changes: `yarn dev`
  - Check `./package.json` for `dev` script. It runs dev commands for docusaurus and package concurrently.
  - Run only docusaurus dev server: `yarn workspace docs start`
  - Run only package build: `yarn workspace your-package-name dev`
    - Package is pre-configured to build out 2 dist paths: 
      - `dist/index.*js` for vanilla JS exports
      - `dist/react.*js` for React exports
    - Docs has an example of importing an example `addNumber` export from `your-package-name` package in `getting-started.mdx`

## Configure package and its deployment on NPM
- Replace all instances of `your-package-name` with your package name
- Replace all instances of `your-org` with your GitHub org name / your username
- Required Settings in Github Repo Settings:
  - Enable Permission: Allow GitHub Actions to create and approve pull requests: https://github.com/changesets/changesets/discussions/1090
  - Add `NPM_TOKEN` to your Repo Actions Secrets.

## Deploy Docusaurus on GitHub pages
- Set GitHub Pages source to "GitHub Actions"
  - Go to Settings -> Pages section -> Build and deployment -> Source: GitHub Actions

## Issues
- Is `changeset` unable to publish? 
  - https://github.com/changesets/action/issues/98#issuecomment-2546826646

