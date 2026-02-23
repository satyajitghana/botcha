import "server-only";

import { redis } from "./redis";
import type { Session } from "./types";

const PREFIX = "session:";

export async function getSession(id: string): Promise<Session | null> {
	const val = await redis.get<Session>(`${PREFIX}${id}`);
	if (!val) return null;
	if (Date.now() > val.expiresAt) {
		await deleteSession(id);
		return null;
	}
	return val;
}

export async function setSession(session: Session): Promise<void> {
	const ttlSeconds = Math.ceil((session.expiresAt - Date.now()) / 1000) + 5;
	await redis.set(`${PREFIX}${session.id}`, session, {
		ex: Math.max(ttlSeconds, 60),
	});
}

export async function deleteSession(id: string): Promise<void> {
	await redis.del(`${PREFIX}${id}`);
}
