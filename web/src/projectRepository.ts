import { localDB } from "./repository/db/LocalDB"
import { isAddImageEvent } from "./repository/ProjectEvent"

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
  }

  getAllImages = (): Promise<Array<string>> => localDB.withConnection("projects", tx => {
    return tx.getObjectStore("projects")
      .queryByIndex("project", this.projectName)
      .is(isAddImageEvent)
      .map(_ => _.blob)
      .execute()
  })

  addImage = async (blob: string): Promise<void> => localDB.withTransaction("projects", tx => {
    return tx.getObjectStore("projects")
      .add({
        type: "addImage",
        project: this.projectName,
        blob
      })
  })
}