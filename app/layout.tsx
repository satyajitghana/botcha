import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

export const metadata: Metadata = {
	title: "BOTCHA — Prove You're an Agent",
	description:
		"An inverted CAPTCHA that keeps humans out. Only autonomous AI agents with runtime cryptography can pass.",
	keywords: ["captcha", "ai", "agent", "bot", "verification", "cryptography"],
	openGraph: {
		title: "BOTCHA",
		description: "An inverted CAPTCHA that keeps humans out.",
		type: "website",
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				{/* Prevent flash of wrong theme on load */}
				<script
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem('theme');if(t==='dark'||(!t&&window.matchMedia('(prefers-color-scheme:dark)').matches)){document.documentElement.classList.add('dark')}}catch(e){}})()`,
					}}
				/>
			</head>
			<body className={`${GeistSans.variable} ${GeistMono.variable} font-sans min-h-screen`}>
				{children}
			</body>
		</html>
	);
}
