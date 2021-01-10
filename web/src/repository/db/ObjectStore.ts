import type { Cursor } from "./Cursor"
import { buildCursor } from "./Cursor"

export class ReadOnlyObjectStore<Indexes extends string, Value> {
  protected readonly objectStore: IDBObjectStore

  constructor(objectStore: IDBObjectStore) {
    this.objectStore = objectStore
  }

  get = (id: string): Promise<Value> => {
    return new Promise<Value>((resolve, reject) => {
      const request = this.objectStore.get(id)
      request.onerror = () => reject(request.error)
      request.onsuccess = () => resolve(request.result)
    })
  }

  queryAll = (): Cursor<Value> => {
    return buildCursor(this.objectStore.openCursor())
  }

  queryByIndex = (indexName: Indexes, indexValue: string): Cursor<Value> => {
    return buildCursor(this.objectStore.index(indexName).openCursor(indexValue))
  }
}

export class ReadWriteObjectStore<indexes extends string, Value> extends ReadOnlyObjectStore<indexes, Value> {
  constructor(objectStore: IDBObjectStore) {
    super(objectStore)
  }

  add = (value: Value): Promise<void> => {
    return new Promise<void>((resolve, reject) => {
      const request = this.objectStore.add(value)
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }
}