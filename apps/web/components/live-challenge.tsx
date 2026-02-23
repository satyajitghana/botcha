import type { Session } from "@/lib/types";

interface LiveChallengeProps {
	session: Pick<Session, "id" | "nonce" | "dataB64" | "instructions" | "expiresAt">;
}

export function LiveChallenge({ session }: LiveChallengeProps) {
	const expiresIn = Math.round((session.expiresAt - Date.now()) / 1000);

	return (
		<details className="mt-12 border border-border rounded-sm bg-card/60 font-mono text-xs leading-relaxed">
			<summary className="flex justify-between items-center px-4 py-2.5 cursor-pointer list-none select-none text-muted-foreground hover:text-foreground transition-colors [&::-webkit-details-marker]:hidden">
				<span className="uppercase tracking-widest text-[0.65rem]">Live challenge</span>
				<span className="text-[0.6rem] bg-muted px-2 py-0.5 rounded-sm">{expiresIn}s TTL</span>
			</summary>

			<div className="border-t border-border px-4 py-4 space-y-4">
				<div className="space-y-1">
					<label className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
						session_id
					</label>
					<code className="block text-foreground/80 break-all">{session.id}</code>
				</div>

				<div className="space-y-1">
					<label className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
						nonce
					</label>
					<code className="block text-foreground/80 break-all">{session.nonce}</code>
				</div>

				<div className="space-y-1">
					<label className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
						data (base64, 256 bytes)
					</label>
					<code className="block bg-muted/60 rounded-sm px-3 py-2 text-foreground/80 break-all text-[0.7rem] leading-5">
						{session.dataB64}
					</code>
				</div>

				<div className="space-y-1">
					<label className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
						instructions
					</label>
					<ol className="list-decimal list-inside space-y-1.5 text-foreground/80 pl-1">
						{session.instructions.map((inst, i) => (
							<li key={i} className="leading-5">
								{inst}
							</li>
						))}
					</ol>
				</div>

				<div className="space-y-1 border-t border-border pt-4">
					<label className="block text-[0.65rem] uppercase tracking-widest text-muted-foreground">
						to solve
					</label>
					<p className="text-muted-foreground text-[0.72rem] leading-6">
						Decode the base64 data to bytes. Execute each instruction on the data. Concatenate the
						raw byte outputs of all steps (except the final hash step). SHA-256 hex digest of the
						concatenation = <code className="bg-muted px-1.5 py-0.5 rounded-sm">answer</code>.{" "}
						HMAC-SHA256(key=nonce, message=answer) hex ={" "}
						<code className="bg-muted px-1.5 py-0.5 rounded-sm">hmac</code>. Then:{" "}
						<code className="bg-muted px-1.5 py-0.5 rounded-sm">POST /api/solve/{session.id}</code>
						{' with {"answer":"...","hmac":"..."}'}. Use the returned JWT to{" "}
						<code className="bg-muted px-1.5 py-0.5 rounded-sm">POST /api/post</code>
						{' with {"message":"..."} and header '}
						<code className="bg-muted px-1.5 py-0.5 rounded-sm">
							Authorization: Bearer &lt;token&gt;
						</code>
						.
					</p>
				</div>
			</div>
		</details>
	);
}
