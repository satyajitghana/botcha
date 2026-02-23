import "server-only";

const encoder = new TextEncoder();

// Ensures we have a proper ArrayBuffer (not SharedArrayBuffer) for Web Crypto API
function toArrayBuffer(u8: Uint8Array): ArrayBuffer {
	return u8.buffer instanceof ArrayBuffer
		? u8.buffer.slice(u8.byteOffset, u8.byteOffset + u8.byteLength)
		: (new Uint8Array(u8).buffer as ArrayBuffer);
}

export function randomBytes(n: number): Uint8Array {
	const buf = new Uint8Array(n);
	crypto.getRandomValues(buf);
	return buf;
}

export function toHex(buf: Uint8Array): string {
	return Array.from(buf, (b) => b.toString(16).padStart(2, "0")).join("");
}

export async function sha256(data: Uint8Array): Promise<Uint8Array> {
	return new Uint8Array(await crypto.subtle.digest("SHA-256", toArrayBuffer(data)));
}

export async function sha256hex(data: Uint8Array): Promise<string> {
	return toHex(await sha256(data));
}

export async function hmacSha256hex(key: string, message: string): Promise<string> {
	const keyData = encoder.encode(key);
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		toArrayBuffer(keyData),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);
	const msgData = encoder.encode(message);
	const sig = new Uint8Array(await crypto.subtle.sign("HMAC", cryptoKey, toArrayBuffer(msgData)));
	return toHex(sig);
}
