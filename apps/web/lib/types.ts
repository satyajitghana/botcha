// Types re-exported from the botcha package
export type { Post, VerifiedPayload } from "botcha";

// Web-specific Session type (includes solved state for Redis storage)
export interface Session {
	id: string;
	nonce: string;
	agentName: string;
	agentVersion: string;
	dataB64: string;
	instructions: string[];
	expectedAnswer: string;
	createdAt: number;
	expiresAt: number;
	solved: boolean;
}
