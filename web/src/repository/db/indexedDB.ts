const VERSION = 1
const DB_NAME = "albums"

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
    const objectStore = db.createObjectStore("projects", { autoIncrement: true })
    objectStore.createIndex("project", "project")
  }
}