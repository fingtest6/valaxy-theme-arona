<p align="center">
Valaxy-Theme-arona<sup><em>(vue)</em></sup>
</p>

[![npm dev dependency version](https://img.shields.io/npm/dependency-version/valaxy-theme-starter/dev/valaxy)](https://github.com/YunYouJun/valaxy)

> This is a template for creating a [valaxy](https://github.com/YunYouJun/valaxy) theme.

## Usage

### Clone to local

> Use [pnpm](https://pnpm.io/), because we need its workspace.

```bash
npx degit fingtest6/valaxy-theme-arona valaxy-theme-name

cd valaxy-theme-name

# If you don't have pnpm installed
npm install -g pnpm

pnpm i
```

### Development

```bash
# dev node
pnpm dev
# dev client
pnpm demo
```

### Build

```bash
pnpm build
```

### Release

> Publish to [npm](https://www.npmjs.com/).

#### Manual

```bash
pnpm ci:publish
```

#### Auto by GitHub Actions

> You can release it by github actions.

Click `Settings` -> `Secrets` -> `Actions` in your GitHub repo.

Add `New repository secret`:

- `NPM_TOKEN`: `your npm token` (Generate from your npm `Access Tokens` - `Automation`)

```bash
npm run release
# choose your version to automatic release
```
## Thanks

arona theme ref theme:

- [starter](https://github.com/valaxyjs/valaxy-theme-starter)
