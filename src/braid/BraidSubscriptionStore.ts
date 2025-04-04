export interface BraidSubscriptionStore {
  set: (key: string, value: any) => Promise<void>;

  get: (key: string) => Promise<any>;

  entries: () => Promise<AsyncIterableIterator<[string, any]>>;

  // entries: () => Promise<{ [key: string]: any}>;
  
  delete: (key: string) => Promise<boolean>;
}

