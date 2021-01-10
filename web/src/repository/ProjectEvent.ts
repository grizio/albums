export type ProjectEvent = AddImageEvent
export type AddImageEvent = {
  type: "addImage"
  project: string
  blob: string
}

export function isAddImageEvent(event: ProjectEvent): event is AddImageEvent {
  return event.type === "addImage"
}