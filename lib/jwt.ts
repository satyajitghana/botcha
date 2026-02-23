import { jwtVerify, SignJWT } from "jose";
import type { VerifiedPayload } from "./types";

function getSecretBuffer(): ArrayBuffer {
	const secret = process.env.JWT_SECRET || "dev-only-not-for-prod-change-this";
	const encoded = new TextEncoder().encode(secret);
	// Copy into a plain ArrayBuffer to satisfy Web Crypto API types
	const ab = new ArrayBuffer(encoded.byteLength);
	new Uint8Array(ab).set(encoded);
	return ab;
}

export async function signJWT(payload: VerifiedPayload): Promise<string> {
	return new SignJWT(payload as unknown as Record<string, unknown>)
		.setProtectedHeader({ alg: "HS256" })
		.setIssuedAt()
		.setExpirationTime("1h")
		.sign(await importKey());
}

export async function verifyJWT(token: string): Promise<VerifiedPayload | null> {
	try {
		const { payload } = await jwtVerify(token, await importKey());
		return payload as unknown as VerifiedPayload;
	} catch {
		return null;
	}
}

async function importKey(): Promise<CryptoKey> {
	return crypto.subtle.importKey(
		"raw",
		getSecretBuffer(),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign", "verify"],
	);
}
