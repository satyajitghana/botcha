import { describe, it, expect } from "vitest";
import { randomBytes, toHex, sha256, sha256hex, hmacSha256hex } from "../src/crypto";

describe("randomBytes", () => {
	it("returns a Uint8Array of the requested length", () => {
		const buf = randomBytes(16);
		expect(buf).toBeInstanceOf(Uint8Array);
		expect(buf.length).toBe(16);
	});

	it("generates different values on each call", () => {
		const a = toHex(randomBytes(16));
		const b = toHex(randomBytes(16));
		expect(a).not.toBe(b);
	});
});

describe("toHex", () => {
	it("converts a buffer to a lowercase hex string", () => {
		const buf = new Uint8Array([0x00, 0xff, 0xab, 0x12]);
		expect(toHex(buf)).toBe("00ffab12");
	});

	it("returns an empty string for an empty buffer", () => {
		expect(toHex(new Uint8Array(0))).toBe("");
	});
});

describe("sha256", () => {
	it("returns a 32-byte Uint8Array", async () => {
		const result = await sha256(new Uint8Array([1, 2, 3]));
		expect(result).toBeInstanceOf(Uint8Array);
		expect(result.length).toBe(32);
	});

	it("returns a known SHA-256 hash for empty input", async () => {
		// SHA-256("") = e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
		const result = await sha256hex(new Uint8Array(0));
		expect(result).toBe("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855");
	});

	it("produces deterministic output", async () => {
		const input = new Uint8Array([10, 20, 30, 40]);
		const a = await sha256hex(input);
		const b = await sha256hex(input);
		expect(a).toBe(b);
	});
});

describe("hmacSha256hex", () => {
	it("returns a 64-char hex string (32 bytes)", async () => {
		const result = await hmacSha256hex("secret-key", "message");
		expect(result).toHaveLength(64);
		expect(result).toMatch(/^[0-9a-f]+$/);
	});

	it("produces deterministic output for the same key+message", async () => {
		const a = await hmacSha256hex("key", "msg");
		const b = await hmacSha256hex("key", "msg");
		expect(a).toBe(b);
	});

	it("differs when key changes", async () => {
		const a = await hmacSha256hex("key1", "msg");
		const b = await hmacSha256hex("key2", "msg");
		expect(a).not.toBe(b);
	});

	it("differs when message changes", async () => {
		const a = await hmacSha256hex("key", "msg1");
		const b = await hmacSha256hex("key", "msg2");
		expect(a).not.toBe(b);
	});

	it("matches a known HMAC-SHA256 value", async () => {
		// HMAC-SHA256(key="key", message="The quick brown fox jumps over the lazy dog")
		// = f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8
		const result = await hmacSha256hex(
			"key",
			"The quick brown fox jumps over the lazy dog",
		);
		expect(result).toBe("f7bc83f430538424b13298e6aa6fb143ef4d59a14946175997479dbc2d1a3cd8");
	});
});
