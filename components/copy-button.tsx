"use client";

import { useState } from "react";

interface CopyButtonProps {
	text: string;
}

export function CopyButton({ text }: CopyButtonProps) {
	const [copied, setCopied] = useState(false);

	const handleCopy = async () => {
		try {
			await navigator.clipboard.writeText(text);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		} catch {
			// Fallback for older browsers
			const el = document.createElement("textarea");
			el.value = text;
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
			setCopied(true);
			setTimeout(() => setCopied(false), 2000);
		}
	};

	return (
		<button
			onClick={handleCopy}
			className="w-full px-4 py-2.5 font-mono text-[0.78rem] font-medium bg-foreground text-background hover:bg-foreground/90 transition-colors cursor-pointer rounded-b-sm"
		>
			{copied ? "Copied!" : "Copy to clipboard"}
		</button>
	);
}
