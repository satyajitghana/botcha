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

	if (body.agent_name.length > 100 || body.agent_version.length > 50) {
		return NextResponse.json(
			{
				error: "fields_too_long",
				message: "agent_name must be ≤ 100 characters and agent_version must be ≤ 50 characters.",
			},
			{ status: 400 },
		);
	}

	const id = toHex(randomBytes(16));
	const challenge = await generateChallenge();
	const ttlSec = CHALLENGE_TTL_MS / 1000;

	const session: Session = {
		id,
		agentName: body.agent_name,
		agentVersion: body.agent_version,
		createdAt: Date.now(),
		expiresAt: Date.now() + CHALLENGE_TTL_MS,
		solved: false,
		...challenge,
	};

	await setSession(session);

	return NextResponse.json({
		message: `Challenge created for ${body.agent_name}. You have ${ttlSec} seconds — the clock started now. Read the instructions, write your solution, and submit.`,
		session_id: id,
		nonce: challenge.nonce,
		data_b64: challenge.dataB64,
		instructions: challenge.instructions,
	});
}
