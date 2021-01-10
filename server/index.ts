import { Application, Router, RouterContext, ServerSentEventTarget } from "https://deno.land/x/oak/mod.ts"

const hostname = "0.0.0.0"
const port = 9080

const projects: Record<string, Array<string>> = {}
const sseTargets: Record<string, Array<ServerSentEventTarget>> = {}

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
  router.get("/sse/:code", sse)
  return router
}

async function getAll({ response }: RouterContext) {
  response.body = JSON.stringify(projects)
}

async function get({ params, response }: RouterContext<{ code: string }>) {
  const project = projects[params.code]
  if (project === undefined) {
    response.body = JSON.stringify(project)
  } else {
    response.status = 404
  }
}

async function add({ params, request, response }: RouterContext<{ code: string }>) {
  const body = await request.body({ type: "text" })
  const value = await body.value
  addToRecord(projects, params.code, value)
  const sse: Array<ServerSentEventTarget> = sseTargets[params.code] ?? []
  sse.forEach(_ => _.dispatchMessage(value))
  response.headers.append("Access-Control-Allow-Origin", "http://localhost:5000")
  response.body = "ok"
  response.status = 200
}

async function sse(ctx: RouterContext<{ code: string }>) {
  const target: ServerSentEventTarget = ctx.sendEvents({ headers: new Headers([["Access-Control-Allow-Origin", "http://localhost:5000"]]) })
  addToRecord(sseTargets, ctx.params.code, target)
  target.addEventListener("close", (evt) => {
    removeFromRecord(sseTargets, ctx.params.code, target)
  })
}

function addToRecord<A>(record: Record<string, Array<A>>, key: string, value: A): void {
  record[key] = [...record[key] ?? [], value]
}

function removeFromRecord<A>(record: Record<string, Array<A>>, key: string, value: A): void {
  record[key] = (record[key] ?? []).filter(_ => _ !== value)
}