export function buildCursor<Value>(buildRequest: () => Promise<IDBRequest<IDBCursorWithValue>>): Cursor<Value> {
  return new CursorWithValidation<Value, Value>(buildRequest, _ => _)
}

export interface Cursor<Value> {
  filter(op: (value: Value) => boolean): Cursor<Value>
  is<AA extends Value>(op: (value: Value) => value is AA): Cursor<AA>
  map<B>(op: (value: Value) => B): Cursor<B>

  execute(): Promise<Array<Value>>
}

class CursorWithValidation<Value, InitialValue> implements Cursor<Value> {
  private readonly buildIDBRequest: () => Promise<IDBRequest<IDBCursorWithValue>>
  private readonly validation: (value: InitialValue) => Value | undefined

  constructor(buildIDBRequest: () => Promise<IDBRequest<IDBCursorWithValue>>, validation: (value: InitialValue) => (Value | undefined)) {
    this.buildIDBRequest = buildIDBRequest
    this.validation = validation
  }

  filter(op: (value: Value) => boolean): Cursor<Value> {
    return new CursorWithValidation(this.buildIDBRequest, this.pipe((value: Value) => {
      if (op(value)) {
        return value
      } else {
        return undefined
      }
    }))
  }

  is<SubValue extends Value>(op: (value: Value) => value is SubValue): Cursor<SubValue> {
    return new CursorWithValidation(this.buildIDBRequest, this.pipe((value: Value) => {
      if (op(value)) {
        return value
      } else {
        return undefined
      }
    }))
  }

  map<B>(op: (value: Value) => B): Cursor<B> {
    return new CursorWithValidation(this.buildIDBRequest, this.pipe((value: Value) => op(value)))
  }

  execute(): Promise<Array<Value>> {
    return this.buildIDBRequest()
      .then(request => {
        return new Promise((resolve, reject) => {
          const result: Array<Value> = []
          request.onsuccess = (event) => {
            // @ts-ignore
            const cursor = event.target.result as IDBCursorWithValue | undefined
            if (cursor) {
              const validatedValue = this.validation(cursor.value as InitialValue)
              if (validatedValue !== undefined) {
                result.push(validatedValue)
              }
              cursor.continue()
            } else {
              resolve(result)
            }
          }
          request.onerror = () => reject(request.error)
        })
      })
  }

  private pipe = <NextValue>(fn: (value: Value) => NextValue | undefined): (value: InitialValue) => NextValue | undefined => {
    return (value: InitialValue) => {
      const intermediateValue = this.validation(value)
      if (intermediateValue !== undefined) {
        return fn(intermediateValue)
      } else {
        return undefined
      }
    }
  }
}