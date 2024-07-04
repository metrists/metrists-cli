# <img src="https://metrists.com/images/metrists-abstract.svg" height="30" />&nbsp;&nbsp;Metrists [![Downloads Per Month](https://img.shields.io/npm/dm/@metrists/cli)](https://www.npmjs.com/package/@metrists/cli) [![Top Language](https://img.shields.io/github/languages/top/metrists/metrists-cli)](https://github.com/metrists/metrists-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT) [![<metrists>](https://circleci.com/gh/metrists/metrists-cli.svg?style=shield)](https://app.circleci.com/pipelines/github/metrists/metrists-cli)

---

## Description

With

## Table of Contents

- [Installation](#installation)
- [GitHub](#sync-using-a-gitHub-repository)
  - [Setting up a repository](#setup-a-locals-github-repository)
  - [Connect your project](#connect-your-project-to-the-repository)
  - [Private repositories](#private-repositories)
  - [GitHub Enterprise](#github-enterprise)
- [Environment Variables](#using-environment-variables-as-fetcher-parameters)
- [Fetchers](#fetchers)
  - [Custom Fetchers](#custom-fetchers)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [LICENSE](#license)

## Installation

```
npm install -g @metrists/cli
```

## Sync using a GitHub Repository

### Setup a locals GitHub Repository

Create a repository with the following structure; or alternatively, clone our [example repository](https://github.com/metrists/locals-example).

```
en/
├─ default/
│  ├─ footer/
│  │  ├─ copyright.json/
│  ├─ welcome.json
fr/
├─ default/
│  ├─ footer/
│  │  ├─ copyright.json/
│  ├─ welcome.json
```

Metrists uses [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes) language codes
standard for your top level folder names.
Your second level of `files/directories` specify the localization namespaces. Inside each namespace, you can nested create directories and json files.

> 🌕 The file structure always follows the pattern: `{language}/{namespace}/{file_key}.json`.

The file `/en/default/welcome.json` contains the following content:

```json
{
  "TITLE": "Metrists is great"
}
```

You can access the phrase `TITLE` using the key `welcome.TITLE` inside the `default` localization [namespace](https://www.i18next.com/principles/translation-resolution#namespaces).

You could also nest your files and directories as deep as you want. See the following examples:

| Language | namespace | key                   | Value               |
| -------- | --------- | --------------------- | ------------------- |
| EN       | default   | welcome.TITLE         | Local Repository    |
| FR       | default   | welcome.TITLE         | Référentiel local   |
| EN       | default   | footer.copyright.TEXT | © 2023 Metrists CLI |

### Connect Your Project to the Repository

Create a file called `.metristssrc` in the root of your repository:

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name"
  }
}
```

1. `fetcher` specifies the mechanisms that grab your localization files. In this case, we will be using `github`.
1. `resolvePath` is the path where your localization files will be store.
1. Specify your github repository and organization in `fetcherParams`. If you are using a personal account, your GitHub organization is your GitHub username.
1. In the root of your project, run:

```
metrists sync
```

✅ Your localization files are now synced with your GitHub repository.

---

### Private Repositories

If you are using a private repository, you will need to create a GitHub Personal Access Token. You can create a token by following the instructions [here](https://docs.github.com/en/github/authenticating-to-github/creating-a-personal-access-token).

Once created, you can provide it to the fetcher with the `token` parameter. You can also use [Environment Variables](#using-environment-variables-for-fetcher-parameters) to provide the token.

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name",
    "token": "github-token-here"
  }
}
```

### GitHub Enterprise

Metrists by default will assume `https://api.github.com` as the API endpoint. If you are using GitHub Enterprise, you can specify the API endpoint with the `baseUrl` parameter:

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name",
    "baseUrl": "https://api.yourcompanygithub.com"
  }
}
```

Or as an [Environment Variable](#using-environment-variables-for-fetcher-parameters):

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name",
    "baseUrl": "env.GITHUB_API_URL"
  }
}
```

## Using Environment Variables as Fetcher Parameters

You can also use Environment Variables to provide fetcher params. Simply add `env.[variable name]` as the value of a fetcher parameter:

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name",
    "token": "env.environment-variable-name"
  }
}
```

Metrists will by default assume that your environment file exists in the root of your project, as `.env`. If you wish to change the path to your environment file, you can use the `envPath` parameter inside your `.metristsrc` file:

```json
{
  "resolvePath": "src/locals",
  "fetcher": "github",
  "fetcherParams": {
    "org": "organization-name",
    "repo": "repository-name",
    "token": "env.environment-variable-name"
  },
  "envPath": "path/to/your/env/file"
}
```

## Fetchers

Fetchers are mechanisms that grab your localization files. Fetchers are responsible for fetching the localization information from a source and outputting it in a JSON format.

The output of all fetchers should look like this:

```json
{
  "[language]": {
    "[namespace]": {
      "[key]": "[phrase]"
    },
    "[another-namespace]": {
      "[key]": {
        "[key]": {
          "[key]": "[value]"
        }
      }
    }
  }
}
```

> 🌕 Phrase can be nested as deep as you want.

### Custom Fetchers

If you wish to create your custom solution for storing your localization files, you can create your own fetcher. All your fetcher needs to do is to `log` a JSON version of your localization output:

```js
console.log(
  JSON.stringify({
    en: {
      default: {
        title: 'Metrists is great',
      },
    },
  }),
);
```

Then you can call upon your fetcher file in your `.metristssrc` file:

```json
{
  "resolvePath": "src/locals",
  "fetcher": "custom-fetcher.js"
}
```

Then run:

```
metrists sync
```

✅ Your localization files are now synced with your custom fetcher.

## Contributing

This package is a beginner-friendly package. If you don't know where to start, visit [Make a Pull Request](https://makeapullrequest.com/) to learn how to make pull requests.

Please visit [Contributing](CONTRIBUTING.md) for more info.

## Code of Conduct

Please visit [Code of Conduct](CODE_OF_CONDUCT.md).

---

# License

MIT
