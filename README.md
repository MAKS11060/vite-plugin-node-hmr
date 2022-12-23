# Vite Plugin Node HMR

## Get started

---

1. Install

    ```bash 
    pnpm add -D @maks11060/vite-plugin-node-hmr
    ```

2. Create a `vite.config.ts` file in your project root:

    ```ts
   import {defineConfig} from 'vite'
   import {nodeHMR} from '@maks11060/vite-plugin-node-hmr'

   export default defineConfig({
     plugins: [nodeHMR()],
     /*plugins: [nodeHMR({
       entry: 'src/index.ts'
     })],*/
   })
   ```

3. Create file `src/index.ts`

   ```ts
   import {defineHandle} from '@maks11060/vite-plugin-node-hmr'
   
   export default defineHandle({
     http: async (req, res) => {res.end('123')},
     // Handle WebSocket connection
     ws: async socket => {socket.send(`Hello WS`)},
   })
   ```

4. Add a npm script to run the dev server

   ```json
   "scripts": {
     "dev": "vite"
   },
   ```