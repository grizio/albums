import { ObjectStore, ObjectStoreName } from "./ObjectStore"

class LocalDB {
  getObjectStore = <Name extends ObjectStoreName>(objectStoreName: Name, mode: IDBTransactionMode): ObjectStore<Name> => {
    return new ObjectStore<Name>(objectStoreName, mode)
  }
}

export const localDB = new LocalDB()