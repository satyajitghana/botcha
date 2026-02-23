"use client";

import { useEffect, useState } from "react";
import Grainient from "@/components/Grainient";

// Warm amber colors matching BOTCHA's parchment light theme
const LIGHT_COLORS = {
	color1: "#F59E0B", // amber-500 — primary accent
	color2: "#FEF3C7", // amber-100 — warm cream
	color3: "#FDE68A", // amber-200 — soft yellow
};

// Warm dark colors matching BOTCHA's dark theme
const DARK_COLORS = {
	color1: "#92400E", // amber-800 — rich dark amber
	color2: "#1C1611", // near-black warm brown
	color3: "#451A03", // amber-950 — darkest warm
};

export function GrainientBackground() {
	const [isDark, setIsDark] = useState(false);

	useEffect(() => {
		const check = () =>
			setIsDark(document.documentElement.classList.contains("dark"));
		check();

		const observer = new MutationObserver(check);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});

		return () => observer.disconnect();
	}, []);

	const colors = isDark ? DARK_COLORS : LIGHT_COLORS;

	return (
		<div className="fixed inset-0 -z-10 opacity-[0.22]">
			<Grainient
				{...colors}
				grainAmount={0.08}
				grainAnimated={false}
				warpStrength={0.8}
				warpFrequency={4.0}
				timeSpeed={0.12}
				saturation={0.85}
				contrast={1.4}
				zoom={0.95}
				className="w-full h-full"
			/>
		</div>
	);
}
