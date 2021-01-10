import type { Cursor } from "./Cursor"
import type { ProjectEvent } from "../ProjectEvent"
import { buildCursor } from "./Cursor"
import { getDB } from "./indexedDB"

export type ObjectStoreName = keyof ObjectStoreMap

export type ObjectStoreMap = {
  projects: ProjectEvent
}

export class ObjectStore<Name extends ObjectStoreName, Value = ObjectStoreMap[Name]> {
  private readonly objectStoreName: Name
  private readonly mode: IDBTransactionMode

  constructor(objectStoreName: Name, mode: IDBTransactionMode) {
    this.objectStoreName = objectStoreName
    this.mode = mode
  }

  get = (id: string): Promise<Value> => {
    return this.withObjectStore(objectStore => new Promise<Value>((resolve, reject) => {
      const request = objectStore.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    }))
  }

  queryAll = (): Cursor<Value> => {
    return buildCursor(() => this.withObjectStore(_ => _.openCursor()))
  }

  queryByIndex = (indexName: string, indexValue: string): Cursor<Value> => {
    return buildCursor(() => this.withObjectStore(_ => _.index(indexName).openCursor(indexValue)))
  }

  add = (value: Value): Promise<void> => {
    return this.withObjectStore(objectStore => new Promise<void>((resolve, reject) => {
      const request = objectStore.add(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    }))
  }

  private withObjectStore = async <Result>(op: (objectStore: IDBObjectStore) => Promise<Result> | Result): Promise<Result> => {
    const db = await getDB()
    const tx = db.transaction(this.objectStoreName, this.mode)
    const objectStore = tx.objectStore(this.objectStoreName)
    return op(objectStore)
  }
}