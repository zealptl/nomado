## 1. Backend Dependencies & Script

- [x] 1.1 Install `express`, `@types/express`, and `tsx` as devDependencies in `backend/package.json`
- [x] 1.2 Add `"dev": "tsx --watch server.ts"` script to `backend/package.json`

## 2. Express Dev Server

- [x] 2.1 Create `backend/server.ts` with `express.json()` middleware on port 3001
- [x] 2.2 Implement filesystem scanner that globs `backend/api/**/*.ts` and converts paths to Express routes (`[param]` → `:param`, `index.ts` → parent path)
- [x] 2.3 Sort routes by specificity (more segments first, static before dynamic) before registration to ensure `reorder` resolves before `[itemId]`
- [x] 2.4 Register each handler with `app.all(route, handler)` so all HTTP methods are covered

## 3. Vite Proxy

- [x] 3.1 Add `server.proxy` config to `frontend/vite.config.ts` forwarding `/api` → `http://localhost:3001`

## 4. Launch Config

- [x] 4.1 Update `.vscode/launch.json` Backend config to use `runtimeExecutable: "npm"`, `runtimeArgs: ["run", "dev"]`, `cwd: "${workspaceFolder}/backend"`

## 5. Vercel Config Cleanup

- [x] 5.1 Remove the `functions` block from `vercel.json`
