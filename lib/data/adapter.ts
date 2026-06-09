import type {
  AdapterDescriptor,
  CollectionName,
  CollectionRecord,
  ListOptions,
  LogCollectionName,
  QueryFilter,
  UpdatePatch,
} from "@/lib/data/types";

export interface DataAdapter {
  readonly mode: "local" | "github";
  describe(): AdapterDescriptor;
  list<C extends CollectionName>(collection: C, options?: ListOptions<C>): Promise<Array<CollectionRecord<C>>>;
  get<C extends CollectionName>(collection: C, id: string): Promise<CollectionRecord<C> | null>;
  create<C extends CollectionName>(collection: C, record: CollectionRecord<C>): Promise<CollectionRecord<C>>;
  update<C extends CollectionName>(collection: C, id: string, patch: UpdatePatch<C>): Promise<CollectionRecord<C>>;
  softDelete<C extends CollectionName>(collection: C, id: string): Promise<CollectionRecord<C>>;
  query<C extends CollectionName>(collection: C, filter?: QueryFilter<C>): Promise<Array<CollectionRecord<C>>>;
  appendLog<C extends LogCollectionName>(collection: C, record: CollectionRecord<C>): Promise<CollectionRecord<C>>;
}

export type { AdapterDescriptor, CollectionName, CollectionRecord, ListOptions, QueryFilter, UpdatePatch };
