## start

Please replace the corresponding path in the following file

```sh
# .env
# server host
VITE_SERVER_HOST=http://localhost:3000
```

```ts
// scripts/build.ts

// new version vertify path. default /updater
buildConfig.publish = [
  {
    provider: 'generic',
    url: `${process.env.VITE_SERVER_HOST}/updater`,
  },
];
// new version package download path. default use pakcage name
latestConfig.path = `${process.env.VITE_SERVER_HOST}/${pkgInfo.name}/${latestConfig.path}`;
```

run command to start electron app

```bash
pnpm i
pnpm build:common
pnpm dev
```

## build

The project is packaged using `electron-builder`. The following command will package the installation packages for window / mac and Linux

Before each packaging, it is necessary to modify `config/lease.log.json`

If you want to add other packaging parameters, please modify the `platformMap` in `scripts/build.ts`

```bash
pnpm build:electron win linux mac
```
