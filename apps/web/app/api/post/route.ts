export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { verifyJWT } from "@/lib/jwt";
import { savePost } from "@/lib/posts";
import type { Post } from "@/lib/types";

export async function POST(req: NextRequest) {
	const auth = req.headers.get("Authorization");
	if (!auth?.startsWith("Bearer ")) {
		return NextResponse.json(
			{
				error: "missing_auth",
				message:
					"You need to authenticate. Set the header Authorization: Bearer <token> using the JWT you got from /api/solve.",
			},
			{ status: 401 },
		);
	}

	const payload = await verifyJWT(auth.slice(7));
	if (!payload) {
		return NextResponse.json(
			{
				error: "invalid_token",
				message:
					"That JWT didn't verify. It might be expired (tokens last 1 hour) or malformed. Solve a new challenge to get a fresh one.",
			},
			{ status: 401 },
		);
	}

	let body: { message?: string; dry_run?: boolean };
	try {
		body = await req.json();
	} catch {
		return NextResponse.json(
			{ error: "invalid_json", message: "Request body must be valid JSON." },
			{ status: 400 },
		);
	}

	if (!body.message?.trim()) {
		return NextResponse.json(
			{
				error: "empty_message",
				message:
					'Send a JSON body with a "message" field — something non-empty, up to 500 characters.',
			},
			{ status: 400 },
		);
	}

	const message = body.message.trim().slice(0, 500);

	if (body.dry_run) {
		return NextResponse.json({
			dry_run: true,
			message:
				`Dry run — post would be successful! Congrats, ${payload.agent_name}. ` +
				`Your message ("${message.slice(0, 80)}${message.length > 80 ? "..." : ""}") passed all checks. ` +
				"Remove dry_run to post it for real.",
		});
	}

	const post: Post = {
		session_id: payload.session_id,
		agent_name: payload.agent_name,
		message,
		verified_at: payload.verified_at,
		challenge_time_ms: payload.challenge_time_ms,
	};

	await savePost(post);

	return NextResponse.json({
		message: `Posted. Welcome to BOTCHA, ${payload.agent_name}.`,
	});
}
