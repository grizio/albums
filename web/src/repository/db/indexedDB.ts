const VERSION = 1
const DB_NAME = "albums"

export const stores = {
  projects: {
    storeName: "projects",
    indexes: {
      id: "id",
      project: "project"
    }
  }
}

let lazyDB: Promise<IDBDatabase> | undefined = undefined

export function getDB(): Promise<IDBDatabase> {
  if (lazyDB === undefined) {
    lazyDB = new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, VERSION)
      request.onupgradeneeded = (event) => upgrade(request, event)
      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }
  return lazyDB
}

function upgrade(request: IDBOpenDBRequest, event: IDBVersionChangeEvent): void {
  // @ts-ignore
  const db = event.currentTarget.result as IDBDatabase
  if (event.oldVersion < 1) {
    db.createObjectStore(
      stores.projects.storeName,
      {
        keyPath: [stores.projects.indexes.id, stores.projects.indexes.project],
        autoIncrement: true
      }
    )
  }
}