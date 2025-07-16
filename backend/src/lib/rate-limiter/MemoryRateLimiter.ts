import { IRateLimiter } from "./IRateLimiter";

type Data = {
  count: number;
  firstHit: number;
};

export class MemoryRateLimiter implements IRateLimiter {
  private storage = new Map<string, Data>();

  constructor(private windowMs: number, private max: number) {}

  async check(key: string): Promise<boolean> {
    const now = Date.now();
    const record = this.storage.get(key);

    if (!record || now - record.firstHit > this.windowMs) {
      this.storage.set(key, { count: 0, firstHit: now });
      return false;
    }

    return record.count >= this.max;
  }

  async increment(key: string): Promise<void> {
    const record = this.storage.get(key);
    if (record) {
      record.count += 1;
    } else {
      this.storage.set(key, { count: 1, firstHit: Date.now() });
    }
  }
}
