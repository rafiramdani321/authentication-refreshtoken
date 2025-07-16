export interface IRateLimiter {
  check(key: string): Promise<boolean>;
  increment(key: string): Promise<void>;
}
