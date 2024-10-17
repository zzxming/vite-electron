## start

Please replace the corresponding path in the following file

```ts
// src/assets/api/axios.ts

// server host. use in front request
const baseURL = import.meta.env.MODE === 'development' ? '/api' : 'http://localhost';
```

```ts
// electron/main/constants.ts

// server host. use in request upgrade information and download the upgrade package
export const serverHost = 'http://localhost';
```

```ts
// scripts/build.ts

// server host. write in latest.yml to download the upgrade package
latestConfig.path = `http://localhost/electron-app/${latestConfig.path}`;
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
