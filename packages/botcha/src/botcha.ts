import { generateChallenge } from "./challenge";
import { hmacSha256hex, randomBytes, toHex } from "./crypto";
import type { Session, VerifiedPayload } from "./types";

export interface BotchaConfig {
	/** JWT secret for signing/verifying tokens. At least 32 chars. */
	secret: string;
	/** Challenge TTL in milliseconds. Default: 30000 (30s). */
	ttlMs?: number;
}

export interface ChallengeResult {
	sessionId: string;
	session: Session;
	/** What to return to the agent: session_id, nonce, data_b64, instructions */
	response: {
		session_id: string;
		nonce: string;
		data_b64: string;
		instructions: string[];
		message: string;
	};
}

export interface SolveResult {
	token: string;
	payload: VerifiedPayload;
}

/**
 * Botcha — Bot authentication for AI agents.
 *
 * Proves that a client is an autonomous AI agent by requiring it to
 * solve a cryptographic challenge within 30 seconds.
 *
 * @example
 * ```ts
 * import { Botcha } from 'botcha'
 *
 * const botcha = new Botcha({ secret: process.env.BOTCHA_SECRET! })
 *
 * // In your challenge endpoint:
 * const { session, response } = await botcha.createChallenge({
 *   agentName: 'clawdbot',
 *   agentVersion: '1.0',
 * })
 * // Store `session` in your database/cache, return `response` to the agent.
 *
 * // In your solve endpoint:
 * const { token } = await botcha.solve(session, { answer, hmac })
 * // Return `token` (JWT) to the agent for subsequent authenticated requests.
 *
 * // In protected route handlers:
 * const payload = await botcha.verifyToken(token)
 * if (!payload) return unauthorized()
 * ```
 */
export class Botcha {
	private secret: string;
	private ttlMs: number;

	constructor(config: BotchaConfig) {
		if (!config.secret) throw new Error("[botcha] secret is required");
		this.secret = config.secret;
		this.ttlMs = config.ttlMs ?? 30_000;
	}

	/**
	 * Generate a new cryptographic challenge for an agent.
	 * Store the returned `session` in your session store (Redis, DB, etc.)
	 * and return `response` directly to the agent.
	 */
	async createChallenge(opts: {
		agentName: string;
		agentVersion: string;
	}): Promise<ChallengeResult> {
		const id = toHex(randomBytes(16));
		const challenge = await generateChallenge();
		const now = Date.now();
		const ttlSec = this.ttlMs / 1000;

		const session: Session = {
			id,
			nonce: challenge.nonce,
			agentName: opts.agentName,
			agentVersion: opts.agentVersion,
			dataB64: challenge.dataB64,
			instructions: challenge.instructions,
			expectedAnswer: challenge.expectedAnswer,
			createdAt: now,
			expiresAt: now + this.ttlMs,
			solved: false,
		};

		return {
			sessionId: id,
			session,
			response: {
				session_id: id,
				nonce: challenge.nonce,
				data_b64: challenge.dataB64,
				instructions: challenge.instructions,
				message: `Challenge created for ${opts.agentName}. You have ${ttlSec}s — the clock started now.`,
			},
		};
	}

	/**
	 * Verify an agent's solution. Returns a signed JWT on success.
	 * Throws a `BotchaError` with an error code on failure.
	 */
	async solve(
		session: Session,
		submission: { answer: string; hmac: string },
	): Promise<SolveResult> {
		if (Date.now() > session.expiresAt) {
			throw new BotchaError("session_expired", "The challenge timed out. Start over.");
		}
		if (session.solved) {
			throw new BotchaError("already_solved", "This challenge was already solved.");
		}
		if (!submission.answer || !submission.hmac) {
			throw new BotchaError("missing_fields", 'Both "answer" and "hmac" are required.');
		}

		const expectedHmac = await hmacSha256hex(session.nonce, submission.answer);
		if (submission.hmac !== expectedHmac) {
			throw new BotchaError(
				"invalid_hmac",
				"HMAC mismatch. Compute HMAC-SHA256(key=nonce, message=answer) with both as UTF-8 strings.",
			);
		}
		if (submission.answer !== session.expectedAnswer) {
			throw new BotchaError(
				"wrong_answer",
				"Wrong answer. Re-read the instructions — skip decoys. Concatenate raw byte outputs, then SHA-256.",
			);
		}

		const elapsed = Date.now() - session.createdAt;
		const payload: VerifiedPayload = {
			type: "agent_verified",
			agent_name: session.agentName,
			agent_version: session.agentVersion,
			verified_at: Math.floor(Date.now() / 1000),
			challenge_time_ms: elapsed,
			session_id: session.id,
		};

		const token = await this._signJWT(payload);
		return { token, payload };
	}

	/**
	 * Verify a JWT token issued by `solve()`.
	 * Returns the payload if valid, `null` if invalid or expired.
	 */
	async verifyToken(token: string): Promise<VerifiedPayload | null> {
		try {
			const { jwtVerify } = await import("jose");
			const key = await this._importKey();
			const { payload } = await jwtVerify(token, key);
			return payload as unknown as VerifiedPayload;
		} catch {
			return null;
		}
	}

	private async _signJWT(payload: VerifiedPayload): Promise<string> {
		const { SignJWT } = await import("jose");
		const key = await this._importKey();
		return new SignJWT(payload as unknown as Record<string, unknown>)
			.setProtectedHeader({ alg: "HS256" })
			.setIssuedAt()
			.setExpirationTime("1h")
			.sign(key);
	}

	private async _importKey(): Promise<CryptoKey> {
		const encoded = new TextEncoder().encode(this.secret);
		const ab = new ArrayBuffer(encoded.byteLength);
		new Uint8Array(ab).set(encoded);
		return crypto.subtle.importKey("raw", ab, { name: "HMAC", hash: "SHA-256" }, false, [
			"sign",
			"verify",
		]);
	}
}

/** Structured error from Botcha operations */
export class BotchaError extends Error {
	constructor(
		public readonly code:
			| "session_expired"
			| "already_solved"
			| "missing_fields"
			| "invalid_hmac"
			| "wrong_answer",
		message: string,
	) {
		super(message);
		this.name = "BotchaError";
	}
}
