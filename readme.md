<div align="center">
<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

<h1>Metrists CLI 🦾</h1>

<p> Simple Localization as a Service  </p>

</div>

---

[![Downloads Per Month](https://img.shields.io/npm/dm/@metrists)](https://www.npmjs.com/package/js-exec) [![Top Language](https://img.shields.io/github/languages/top/metrists/metrists-cli)](https://github.com/metrists/metrists-cli/) [![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![<metrists>](https://circleci.com/gh/metrists/metrists-cli.svg?style=shield)](https://app.circleci.com/pipelines/github/metrists/metrists-cli)

## Description

The Metrists CLI is a command-line interface tool that helps you loosely couple your localization and copyrighting from your source code. Metrists gives you the freedom to store your localization files outside of your source-code.

- [Features](#features)
- [Executing TypeScript](#execute-typescript)
- [Installation](#installation)
- [Usage](#usage)
  - [Basic](#usage)
  - [Callbacks](#callbacks)
  - [Interceptors](#interceptors)
  - [Global Values](#global-values)
- [Contributing](#contributing)
- [Code of Conduct](#code-of-conduct)
- [LICENSE](#license)

## Installation

```
npm install -g @metrists/cli
```

## Sync using a GitHub Repository

### Setup a locals GitHub Repository

Create a repository with the following structure:

```
en/
├─ namespace_title/
│  ├─ titles.json
fr/
├─ namespace_title/
```

Use [ISO 639-1](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)
standard for your top level folder names.
Your second level of files/directories specify the localization namespaces. Inside each namespace, you can nested create directories and json files.

For example, let's say you have a file called `main_page` in the following path `en/default_namespace/titles/main_page.json`:

```json
{
  "main_title": "Metrists is great"
}
```

You can access your phrase using the key `titles.main_page.main_tile` when your localization namespace is set to `default_namespace` and language is set to `en`.

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

1. `fetcher` specifies the mechanisms that grab your localization files. (see [Fetchers](#fetchers)). In this case, we will be using `github`.
1. `resolvePath` is the path where your localization files will be store.
1. Specify your github repository and organization in `fetcherParams`. If you are using a personal account, your GitHub organization is your GitHub username.
   <!-- - If your `fetcherParams` contains secrets, you can use `env.` an environment variable name, instead of the actual value. -->
1. In the root of your project, run:

```
metrists sync
```

### Callbacks

The `exec`function will accept a second parameter—i.e. `options`—for additional customizations.

You can pass in `onSuccess` and `onError` callbacks to the `options` object:

```ts
import { exec } from 'js-exec';

const source = `console.log("Hello from js-exec 👋");`;

const sandbox = exec(source, {
  onSuccess: () => console.log('Taadaa 🎉🎉'),
  onError: (e: Error) => console.log('Something occurred 🥺\n', e),
});

sandbox({});
// Something occurred 🥺
// TypeError: Cannot read property 'log' of undefined

sandbox({ console });
// Hello from js-exec 👋
// Taadaa 🎉🎉
```

### Interceptors

Interceptors will help you run functions on the code, before it gets executed.

Each Interceptor receives a `source: string` and returns a transformed `source: string`.

```ts
import { exec, Source } from 'js-exec';

const source = `console.log("There are some f***s here!");`;

//Removes bad words inside the source
const removeBadWords = (source: Source): Source => {
  let cleanSource = source;
  const badWordsArray = ['f***'];
  const textToReplace = '🚫BAD WORD🚫';
  badWordsArray.forEach(
    (word) => (cleanSource = cleanSource.replace(word, textToReplace)),
  );
  return cleanSource;
};

//Interceptors are run sequentially
const interceptors = [removeBadWords];

//interceptors are passed into the options object
const runCode = exec(source, { interceptors });
runCode({ console });
// There are some 🚫BAD WORD🚫s here!
```

### Global Values

You can also make values available, on all executions of the sandbox; If, you wish to re-use them.

```ts
const pi = 3.141592;

const globalValues = { pi };

//pi will be available on every execution of runCode
const runCode = exec(source, { globalValues });
```

## Contributing

This package is a beginner-friendly package. If you don't know where to start, visit [Make a Pull Request](https://makeapullrequest.com/) to learn how to make pull requests.

Please visit [Contributing](CONTRIBUTING.md) for more info.

## Code of Conduct

Please visit [Code of Conduct](CODE_OF_CONDUCT.md).

---

# License

MIT
