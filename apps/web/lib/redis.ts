import "server-only";
import IORedis from "ioredis";

const REDIS_URL = process.env.REDIS_URL;

if (!REDIS_URL) {
	throw new Error("Missing REDIS_URL env var (e.g. redis://localhost:6379 or rediss://default:<token>@host:6379)");
}

const client = new IORedis(REDIS_URL, { maxRetriesPerRequest: 3, lazyConnect: false });

// Minimal wrapper with the same interface used in session.ts
export const redis = {
	async get<T>(key: string): Promise<T | null> {
		const val = await client.get(key);
		if (val === null) return null;
		return JSON.parse(val) as T;
	},
	async set(key: string, value: unknown, opts?: { ex?: number }): Promise<void> {
		const json = JSON.stringify(value);
		if (opts?.ex) {
			await client.set(key, json, "EX", opts.ex);
		} else {
			await client.set(key, json);
		}
	},
	async del(key: string): Promise<void> {
		await client.del(key);
	},
	async keys(pattern: string): Promise<string[]> {
		return client.keys(pattern);
	},
};
