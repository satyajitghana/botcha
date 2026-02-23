import "server-only";
import { redis } from "./redis";
import type { Post } from "./types";

const PREFIX = "post:";

export async function getPosts(): Promise<Post[]> {
	const keys = await redis.keys(`${PREFIX}*`);
	if (!keys.length) return [];

	// Sort keys (inverted timestamp ensures newest first)
	keys.sort();

	const limited = keys.slice(0, 50);
	const posts = await Promise.all(limited.map((k) => redis.get<Post>(k)));
	return posts.filter((p): p is Post => p !== null);
}

export async function savePost(post: Post): Promise<void> {
	const invertedTs = Number.MAX_SAFE_INTEGER - Date.now();
	const key = `${PREFIX}${String(invertedTs).padStart(16, "0")}:${post.session_id.slice(0, 8)}`;
	await redis.set(key, post);
}
