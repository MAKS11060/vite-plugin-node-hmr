import type {IncomingMessage, ServerResponse} from 'http'
import type {Connect, Plugin, ViteDevServer} from 'vite'
import WS from 'ws'

type WebSocket = WS.WebSocket
export type {WebSocket}

interface PluginConfig {
  /** Default: `src/index.ts` */
  entry?: string
}

export interface DefineHandle {
  http: (req: IncomingMessage, res: ServerResponse) => void
  ws?: (socket: WebSocket, req: IncomingMessage) => void
}

const createMiddleware = (server: ViteDevServer, entry: string): Connect.NextHandleFunction => {
  server.ssrLoadModule(entry) // preload

  server.httpServer.on('upgrade', async (req, socket, head) => {
    const ws = new WS.WebSocketServer({noServer: true})
    ws.handleUpgrade(req, socket, head, async (client, request) => {
      const appModule = await server.ssrLoadModule(entry) // preload
      const app = appModule.default as DefineHandle
      if (app?.ws) {
        app.ws(client, request)
      }
    })
  })

  return async (req, res) => {
    const appModule = await server.ssrLoadModule(entry)
    const app = appModule.default as DefineHandle
    if (app?.http) {
      try {
        app.http(req, res)
      } catch (e) {
        res.destroy(e.message)
      }
    } else {
      console.warn('Request handler not defined')
      process.exit(1)
    }
  }
}

export const defineHandle = <T extends DefineHandle>(handle: T): T => handle

export const nodeHMR = (pluginConfig: PluginConfig = {}): Plugin => {
  const {entry = 'src/index.ts'} = pluginConfig
  return {
    name: 'vite-plugin-node-hmr',
    config: (config, env) => {
      return {
        build: {
          ssr: entry,
          rollupOptions: {
            input: entry,
          },
        },
        server: {
          hmr: false,
        },
        appType: 'custom',
      }
    },
    configureServer: (server) => {
      server.middlewares.use(createMiddleware(server, entry))
    },
  }
}

export default nodeHMR
