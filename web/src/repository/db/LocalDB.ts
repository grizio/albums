import { ReadOnlyTransaction, ReadWriteTransaction } from "./Transaction"
import { getDB } from "./indexedDB"
import type { Stores } from "./Structure"

type TxOperation<Tx, Result> = (tx: Tx) => Promise<Result>

class LocalDB {
  withConnection = async <TxStoreNames extends keyof Stores, Result>(
    stores: TxStoreNames | Array<TxStoreNames>,
    op: TxOperation<ReadOnlyTransaction<TxStoreNames>, Result>
  ): Promise<Result> => {
    const db = await getDB()
    const tx = db.transaction(stores, "readonly")
    try {
      return await op(new ReadOnlyTransaction(tx))
    } catch (e) {
      console.log("error", e)
      tx.abort()
      throw e
    }
  }

  withTransaction = async <TxStoreNames extends keyof Stores, Result>(
    stores: TxStoreNames | Array<TxStoreNames>,
    op: TxOperation<ReadWriteTransaction<TxStoreNames>, Result>
  ): Promise<Result> => {
    const db = await getDB()
    const tx = db.transaction(stores, "readwrite")
    try {
      return await op(new ReadWriteTransaction(tx))
    } catch (e) {
      console.log("error", e)
      tx.abort()
      throw e
    }
  }
}

export const localDB = new LocalDB()