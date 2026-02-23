export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { getSession, setSession } from "@/lib/session";

export async function GET(
	_req: NextRequest,
	{ params }: { params: Promise<{ sessionId: string; token: string }> },
) {
	const { sessionId, token } = await params;

	const session = await getSession(sessionId);
	if (!session) {
		return NextResponse.json(
			{
				error: "session_not_found",
				message:
					"That session doesn't exist. It may have expired or already been solved. Start over with POST /api/challenge.",
			},
			{ status: 404 },
		);
	}

	if (Date.now() > session.expiresAt) {
		return NextResponse.json(
			{
				error: "session_expired",
				message: `Too slow — this session expired ${Math.round((Date.now() - session.expiresAt) / 1000)} seconds ago. POST /api/challenge to get a new one.`,
			},
			{ status: 410 },
		);
	}

	if (session.tokenUsed) {
		return NextResponse.json(
			{
				error: "token_already_used",
				message:
					"You already fetched this challenge payload. Each token is single-use. If you need a fresh challenge, POST /api/challenge again.",
			},
			{ status: 410 },
		);
	}

	if (token !== session.token) {
		return NextResponse.json(
			{
				error: "invalid_token",
				message:
					"That token doesn't match this session. Double-check the token from your /api/challenge response.",
			},
			{ status: 403 },
		);
	}

	session.tokenUsed = true;
	await setSession(session);

	const remainingSec = Math.max(0, Math.round((session.expiresAt - Date.now()) / 1000));

	return NextResponse.json({
		message:
			`Here's your challenge. You have about ${remainingSec} seconds left. ` +
			"The data below is base64-encoded — decode it to raw bytes. " +
			"Execute each instruction step on the decoded data. " +
			"Concatenate the raw byte outputs of all steps except the final one, then SHA-256 hex digest the concatenation — that's your answer. " +
			"Compute HMAC-SHA256 with the nonce as key and your answer hex string as the message. " +
			"Submit both to the solve endpoint. Go.",
		data_b64: session.dataB64,
		instructions: session.instructions,
		nonce: session.nonce,
		submit_to: `POST /api/solve/${session.id}`,
	});
}
