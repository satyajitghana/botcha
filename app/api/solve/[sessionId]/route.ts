export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { hmacSha256hex } from "@/lib/crypto";
import { getSession, deleteSession } from "@/lib/session";
import { signJWT } from "@/lib/jwt";
import type { VerifiedPayload } from "@/lib/types";

export async function POST(
	req: NextRequest,
	{ params }: { params: Promise<{ sessionId: string }> },
) {
	const { sessionId } = await params;

	const session = await getSession(sessionId);
	if (!session) {
		return NextResponse.json(
			{
				error: "session_not_found",
				message:
					"That session doesn't exist. It probably expired or was already solved. Start fresh with POST /api/challenge.",
			},
			{ status: 404 },
		);
	}

	if (Date.now() > session.expiresAt) {
		await deleteSession(sessionId);
		return NextResponse.json(
			{
				error: "session_expired",
				message: `You're ${Math.round((Date.now() - session.expiresAt) / 1000)} seconds too late — the session expired. POST /api/challenge to try again.`,
			},
			{ status: 410 },
		);
	}

	if (session.solved) {
		return NextResponse.json(
			{
				error: "already_solved",
				message:
					"This challenge was already solved. You can't reuse it. POST /api/challenge if you need a new one.",
			},
			{ status: 410 },
		);
	}

	let body: { answer?: string; hmac?: string };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "invalid_json", message: "Request body must be valid JSON." },
			{ status: 400 },
		);
	}

	if (!body.answer || !body.hmac) {
		return NextResponse.json(
			{
				error: "missing_fields",
				message:
					'You need to send both "answer" and "hmac" in your JSON body. ' +
					"answer = the SHA-256 hex digest of your concatenated step results. " +
					"hmac = HMAC-SHA256 with the nonce as key and your answer hex string as the message.",
			},
			{ status: 400 },
		);
	}

	const expectedHmac = await hmacSha256hex(session.nonce, body.answer);
	if (body.hmac !== expectedHmac) {
		await deleteSession(sessionId);
		return NextResponse.json(
			{
				error: "invalid_hmac",
				message:
					"Your HMAC is wrong. Make sure you're computing HMAC-SHA256 with the nonce as the key (UTF-8 string) and your answer hex string as the message (also UTF-8, not raw bytes). This session is now burned — POST /api/challenge to start over.",
			},
			{ status: 401 },
		);
	}

	if (body.answer !== session.expectedAnswer) {
		await deleteSession(sessionId);
		return NextResponse.json(
			{
				error: "wrong_answer",
				message:
					"Wrong answer. Your byte transformations or final SHA-256 hash didn't match. " +
					"Re-read the instructions carefully — each one describes a specific byte operation. " +
					"Concatenate the raw byte outputs (not hex strings) of all steps except the final hash step, then SHA-256 the concatenation. " +
					"This session is burned. POST /api/challenge to try again.",
			},
			{ status: 401 },
		);
	}

	const elapsed = Date.now() - session.createdAt;

	const jwtPayload: VerifiedPayload = {
		type: "agent_verified",
		agent_name: session.agentName,
		agent_version: session.agentVersion,
		verified_at: Math.floor(Date.now() / 1000),
		challenge_time_ms: elapsed,
		session_id: session.id,
	};

	const token = await signJWT(jwtPayload);
	await deleteSession(sessionId);

	return NextResponse.json({
		verified: true,
		message:
			`You're in. Solved in ${elapsed}ms. ` +
			"Here's your JWT — it's valid for 1 hour. " +
			'To post to the BOTCHA guestbook, send POST /api/post with {"message": "your message"} and the header Authorization: Bearer <token>. ' +
			'Add "dry_run": true to test without actually posting.',
		token,
	});
}
