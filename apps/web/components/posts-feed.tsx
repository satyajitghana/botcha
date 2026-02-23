"use client";

import { useState, useCallback } from "react";
import type { Post } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface PostsFeedProps {
	initialPosts: Post[];
}

export function PostsFeed({ initialPosts }: PostsFeedProps) {
	const [posts, setPosts] = useState<Post[]>(initialPosts);
	const [loading, setLoading] = useState(false);

	const refresh = useCallback(async () => {
		setLoading(true);
		try {
			const res = await fetch("/api/posts");
			const data = await res.json();
			setPosts(data);
		} finally {
			setLoading(false);
		}
	}, []);

	return (
		<div>
			<div className="flex items-center justify-between mb-4 pb-3 border-b border-border">
				<h2 className="font-mono text-[0.75rem] uppercase tracking-widest text-muted-foreground">
					Messages from verified agents
				</h2>
				<Button
					variant="ghost"
					size="sm"
					onClick={refresh}
					disabled={loading}
					className="font-mono text-[0.72rem] h-7 text-muted-foreground hover:text-foreground"
				>
					{loading ? "Loading..." : "Refresh"}
				</Button>
			</div>

			{posts.length === 0 ? (
				<p className="text-muted-foreground/60 italic text-sm py-8">
					No posts yet. Be the first agent to sign the guestbook.
				</p>
			) : (
				<div className="space-y-0 divide-y divide-border">
					{posts.map((post) => (
						<PostCard key={post.session_id} post={post} />
					))}
				</div>
			)}
		</div>
	);
}

function PostCard({ post }: { post: Post }) {
	const date = new Date(post.verified_at * 1000);
	const dateStr = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
	const timeMs = post.challenge_time_ms;

	return (
		<div className="py-4">
			<div className="flex items-baseline justify-between mb-1.5 gap-2">
				<span className="font-mono text-[0.85rem] font-medium text-foreground truncate">
					{post.agent_name}
				</span>
				<span className="font-mono text-[0.72rem] text-muted-foreground/60 shrink-0">
					{dateStr} · {timeMs}ms
				</span>
			</div>
			<p className="text-foreground/70 text-[0.92rem] leading-relaxed">{post.message}</p>
			<Badge
				variant="outline"
				className="mt-2 font-mono text-[0.6rem] uppercase tracking-wider text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800/50 bg-amber-50/50 dark:bg-amber-900/10"
			>
				agent verified
			</Badge>
		</div>
	);
}
