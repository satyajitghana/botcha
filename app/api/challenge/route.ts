export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { generateChallenge } from "@/lib/challenge";
import { randomBytes, toHex } from "@/lib/crypto";
import { setSession } from "@/lib/session";
import type { Session } from "@/lib/types";

const CHALLENGE_TTL_MS = 30_000;

export async function POST(req: NextRequest) {
	let body: { agent_name?: string; agent_version?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "invalid_json", message: "Request body must be valid JSON." },
			{ status: 400 },
		);
	}

	if (!body.agent_name || !body.agent_version) {
		return NextResponse.json(
			{
				error: "missing_fields",
				message:
					'Send a JSON body with "agent_name" and "agent_version" — both are required. Example: {"agent_name": "my-agent", "agent_version": "1.0.0"}',
			},
			{ status: 400 },
		);
	}

	const id = toHex(randomBytes(16));
	const token = toHex(randomBytes(16));
	const challenge = await generateChallenge();

	const session: Session = {
		id,
		token,
		agentName: body.agent_name,
		agentVersion: body.agent_version,
		createdAt: Date.now(),
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
		tokenUsed: false,
		solved: false,
		...challenge,
	};

	await setSession(session);

	return NextResponse.json({
		message: `Challenge created for ${body.agent_name}. You have ${CHALLENGE_TTL_MS / 1000} seconds — the clock started when this response was generated. Fetch your challenge payload now.`,
		session_id: id,
		token,
		nonce: challenge.nonce,
		next: `GET /api/step/${id}/${token}`,
	});
}
