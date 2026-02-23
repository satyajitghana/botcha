"use client";

import { useEffect, useRef, useState } from "react";

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";

interface ScrambleInProps {
	text: string;
	className?: string;
	duration?: number;
	delay?: number;
}

export function ScrambleIn({ text, className, duration = 1200, delay = 0 }: ScrambleInProps) {
	const [display, setDisplay] = useState("");
	const frameRef = useRef<number | null>(null);
	const startRef = useRef<number | null>(null);

	useEffect(() => {
		const timeout = setTimeout(() => {
			const start = performance.now();
			startRef.current = start;

			const animate = (now: number) => {
				const elapsed = now - start;
				const progress = Math.min(elapsed / duration, 1);

				const revealedCount = Math.floor(progress * text.length);

				let result = "";
				for (let i = 0; i < text.length; i++) {
					if (text[i] === " ") {
						result += " ";
					} else if (i < revealedCount) {
						result += text[i];
					} else if (i < revealedCount + 4) {
						result += CHARS[Math.floor(Math.random() * CHARS.length)];
					} else {
						result += text[i];
					}
				}
				setDisplay(result);

				if (progress < 1) {
					frameRef.current = requestAnimationFrame(animate);
				} else {
					setDisplay(text);
				}
			};

			frameRef.current = requestAnimationFrame(animate);
		}, delay);

		return () => {
			clearTimeout(timeout);
			if (frameRef.current) cancelAnimationFrame(frameRef.current);
		};
	}, [text, duration, delay]);

	return <span className={className}>{display || text}</span>;
}
