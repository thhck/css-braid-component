export interface BraidSubscriptionStore {
  set: (key: string, value: any) => Promise<void>;

  get: (key: string) => Promise<any>;

  delete: (key: string) => Promise<boolean>;
}

