// Core SDK class — auth0-style DX
export { Botcha, BotchaError } from "./botcha";
export type { BotchaConfig, ChallengeResult, SolveResult } from "./botcha";

// Lower-level primitives (for custom integrations)
export { generateChallenge } from "./challenge";
export { randomBytes, toHex, sha256, sha256hex, hmacSha256hex } from "./crypto";

// Types
export type { Session, Post, VerifiedPayload } from "./types";
