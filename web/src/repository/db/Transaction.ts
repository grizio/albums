import { ReadOnlyObjectStore, ReadWriteObjectStore } from "./ObjectStore"
import type { Stores } from "./Structure"

export class ReadOnlyTransaction<TxStoreNames extends keyof Stores> {
  private readonly tx: IDBTransaction

  constructor(tx: IDBTransaction) {
    this.tx = tx
  }

  getObjectStore = <Name extends TxStoreNames>(objectStoreName: Name): ReadOnlyObjectStore<Stores[Name]["indexes"], Stores[Name]["value"]> => {
    return new ReadOnlyObjectStore(this.tx.objectStore(objectStoreName))
  }
}

export class ReadWriteTransaction<TxStoreNames extends keyof Stores> {
  private readonly tx: IDBTransaction

  constructor(tx: IDBTransaction) {
    this.tx = tx
  }

  getObjectStore = <Name extends TxStoreNames>(objectStoreName: Name): ReadWriteObjectStore<Stores[Name]["indexes"], Stores[Name]["value"]> => {
    return new ReadWriteObjectStore(this.tx.objectStore(objectStoreName))
  }
}