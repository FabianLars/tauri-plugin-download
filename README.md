# Tauri Plugin Download

![Test](https://github.com/tauri-apps/tauri-plugin-download/workflows/Test/badge.svg)

This plugin provides an interface for file downloads.

## Architecture

This repo shape might appear to be strange, but it is really just a hybrid Rust / Typescript project that recommends a specific type of consumption, namely using GIT as the secure distribution mechanism, and referencing specific unforgeable git hashes. Of course, it can also be consumed via Cargo and NPM.

### `/src`

Rust source code that contains the plugin definition.

### `/webview-src`

Typescript source for the /webview-dist folder that provides an API to interface with the rust code.

### `/webview-dist`

Tree-shakeable transpiled JS to be consumed in a Tauri application.

## Installation

You need to install both the Rust _and_ the JavaScript packages!

There are three general methods of installation that we can recommend.

1. Pull sources directly from Github using git tags / revision hashes (most secure, good for developement, shown below)
2. Git submodule install this repo in your tauri project and then use `file` protocol to ingest the source
3. Use crates.io and npm (easiest, and requires you to trust that our publishing pipeline worked)

For more details and usage see [the example app](examples/svelte-app). Please note, below in the dependencies you can also lock to a revision/tag in both the `Cargo.toml` and `package.json`

### RUST

`src-tauri/Cargo.toml`

```yaml
[dependencies.tauri-plugin-download]
git = "https://github.com/tauri-apps/tauri-plugin-download"
# tag = "v0.1.0" Not yet available
```

Register the plugin in `src-tauri/src/main.rs`:

```rust
use tauri_plugin_download::Download;

fn main() {
    tauri::Builder::default()
        .plugin(Download::init())
        .build()
        .run();
}
```

### WEBVIEW

`Install from a tagged release` (Not yet available)

```
npm install github:tauri-apps/tauri-plugin-download#v0.1.0
# or
yarn add github:tauri-apps/tauri-plugin-download#v0.1.0
```

`Install from a commit`

```
npm install github:tauri-apps/tauri-plugin-download#1234567890abcdefghijklmnopqrstuvwxyz
# or
yarn add github:tauri-apps/tauri-plugin-download#1234567890abcdefghijklmnopqrstuvwxyz
```

`Install from a branch`

```
npm install github:tauri-apps/tauri-plugin-download#main
# or
yarn add github:tauri-apps/tauri-plugin-download#main
```

Use within your JS/TS:

```ts
import download from 'tauri-plugin-download-api'

await download('https://relevant.url/file', '/path/to/file')
```

# License

MIT / Apache-2.0
