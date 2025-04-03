import type { ExpiringStorage } from '../storage/keyvalue/ExpiringStorage';
import type { BraidSubscriptionStore } from './BraidSubscriptionStore';

export class BaseBraidSubscriptionStore implements BraidSubscriptionStore {
  private readonly storage: ExpiringStorage<string, string>;
  private readonly ttl: number;

  public constructor(storage: ExpiringStorage<string, string>, ttl = 3 * 60 * 60) {
    this.storage = storage;
    this.ttl = ttl * 1000; // TODO: what is the ttl ??
  }

  public async set(cookie: string, key: string, value: string): Promise<void> {
    await this.storage.set(cookie+key, value, this.ttl);
  }

  public async get(cookie: string, key: string): Promise<string | undefined> {
    return await this.storage.get(cookie+key);
  }

  public async delete(cookie: string, key: string): Promise<boolean> {
    return this.storage.delete(cookie+key);
  }
}

