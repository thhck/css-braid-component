export interface BraidSubscriptionStore {
  set: (cookie: string, key: string, value: string) => Promise<void>;

  get: (cookie: string, key: string) => Promise<string | undefined>;

  delete: (cookie: string, key: string) => Promise<boolean>;
}

