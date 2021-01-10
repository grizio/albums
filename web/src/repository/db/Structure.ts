import type { ProjectEvent } from "../ProjectEvent"

export type Stores = {
  projects: StoreInfo<"id" | "project", ProjectEvent>
}

export type StoreInfo<Indexes extends string, Value> = {
  indexes: Indexes
  value: Value
}