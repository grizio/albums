import { Application, Router, Request, Response } from 'https://deno.land/x/oak/mod.ts'

const hostname = "0.0.0.0"
const port = 9080

const entries: { [code: string]: Array<string> } = {}

const app = new Application()
const router = buildRouter()
app.use(router.routes())
app.use(router.allowedMethods())

console.log(`Application started on http://${hostname}:${port}`)
await app.listen(`${hostname}:${port}`)


export function buildRouter(): Router {
  const router = new Router()
  router.get("/", getAll)
  router.get("/:code", get)
  router.post("/:code", add)
  return router
}

async function getAll({ response }: { response: Response }) {
  response.body = JSON.stringify(entries)
}

async function get({ params, response }: { params: { code: string }; response: Response }) {
  const project = entries[params.code]
  if (project === undefined) {
    response.body = JSON.stringify(project)
  } else {
    response.status = 404
  }

}

async function add({ params, request, response }: { params: { code: string }, request: Request, response: Response }) {
  const project = entries[params.code] ?? []
  const body = await request.body({ type: "text" })
  entries[params.code] = [...project, await body.value]
  response.headers.append("Access-Control-Allow-Origin", "http://localhost:8080")
  response.body = "ok"
  response.status = 200
}