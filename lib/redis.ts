import { Redis } from "@upstash/redis";

// Strip surrounding quotes that may appear if env vars were set with quotes in the shell
function cleanEnv(val: string | undefined): string {
	if (!val) return "";
	return val.replace(/^["']|["']$/g, "");
}

const url = cleanEnv(process.env.UPSTASH_REDIS_REST_URL);
const token = cleanEnv(process.env.UPSTASH_REDIS_REST_TOKEN);

if (!url || !token) {
	throw new Error("Missing UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN env vars");
}

export const redis = new Redis({ url, token });
