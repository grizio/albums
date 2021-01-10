import { localDB } from "./repository/db/LocalDB"
import { AddImageEvent, isAddImageEvent, ProjectEvent } from "./repository/ProjectEvent"

type Parameters = {
  projectName: string
  projectKey: string
}

export class ProjectRepository {
  private readonly projectName: string
  private readonly projectKey: string

  constructor({ projectName, projectKey }: Parameters) {
    this.projectName = projectName
    this.projectKey = projectKey

    const eventSource = new EventSource(`http://localhost:9080/sse/${this.projectName}`)
    eventSource.onmessage = (event) => {
      const projectEvent = JSON.parse(event.data) as ProjectEvent
      if (isAddImageEvent(projectEvent)) {
        //this.addImage(projectEvent.blob)
      }
    }
  }

  getAllImages = (): Promise<Array<string>> => localDB.withConnection("projects", tx => {
    return tx.getObjectStore("projects")
      .queryByIndex("project", this.projectName)
      .is(isAddImageEvent)
      .map(_ => _.blob)
      .execute()
  })

  addImage = async (blob: string): Promise<void> => {
    const event: AddImageEvent = {
      type: "addImage",
      project: this.projectName,
      blob
    }
    return localDB.withTransaction("projects", tx => {
      return tx.getObjectStore("projects").add(event)
    })
      .then(_ => {
        fetch(`http://localhost:9080/${this.projectName}`, {
          method: "POST",
          body: JSON.stringify(event) //wasm.encrypt(result, "test")
        })
      })
  }
}