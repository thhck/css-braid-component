import type { ExpiringStorage } from '../storage/keyvalue/ExpiringStorage';
import type { BraidSubscriptionStore } from './BraidSubscriptionStore';

export class BaseBraidSubscriptionStore implements BraidSubscriptionStore {
  private readonly storage: ExpiringStorage<string, any>;
  private readonly ttl: number;

  public constructor(storage: ExpiringStorage<string, any>, ttl = 3 * 60 * 60) {
    this.storage = storage;
    this.ttl = ttl * 1000; // TODO: what is the ttl ??
  }

  public async set(key: string, value: any): Promise<void> {
    await this.storage.set(key, value, this.ttl);
  }

  public async get(key: string): Promise<string | undefined> {
    return await this.storage.get(key);
  }

  // public async entries(): Promise<{ [key: string]: any}> {
  public async entries(): Promise<AsyncIterableIterator<[string, any]>> {
    // const result:x { [key: string]: any} = {}
    // const entries =  this.storage.entries()
    // for await (const [key, value] of entries){
    //   result[key] = value
    // }
    // return result
    return this.storage.entries()
  }

  public async delete(key: string): Promise<boolean> {
    return this.storage.delete(key);
  }
}

