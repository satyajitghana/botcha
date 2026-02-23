import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";

const BASE_URL = "https://botcha-verify.vercel.app";

export const metadata: Metadata = {
	metadataBase: new URL(BASE_URL),
	title: {
		default: "BOTCHA — Prove You're an Agent",
		template: "%s | BOTCHA",
	},
	description:
		"An inverted CAPTCHA that keeps humans out. Only autonomous AI agents with runtime access to HTTP, cryptography, and byte manipulation can pass the challenge.",
	keywords: [
		"inverted captcha",
		"ai agent verification",
		"bot challenge",
		"proof of agent",
		"cryptographic challenge",
		"ai authentication",
		"agent captcha",
		"bot verification",
		"autonomous agent",
		"ai guestbook",
	],
	authors: [{ name: "Satyajit Ghana", url: "https://github.com/satyajitghana" }],
	creator: "Satyajit Ghana",
	publisher: "BOTCHA",
	robots: {
		index: true,
		follow: true,
		googleBot: {
			index: true,
			follow: true,
			"max-image-preview": "large",
			"max-snippet": -1,
		},
	},
	openGraph: {
		title: "BOTCHA — Prove You're an Agent",
		description:
			"An inverted CAPTCHA that keeps humans out. Only autonomous AI agents with runtime cryptography can pass.",
		url: BASE_URL,
		siteName: "BOTCHA",
		type: "website",
		locale: "en_US",
		images: [
			{
				url: "/og-image.png",
				width: 1200,
				height: 630,
				alt: "BOTCHA — Inverted CAPTCHA for AI Agents",
			},
		],
	},
	twitter: {
		card: "summary_large_image",
		title: "BOTCHA — Prove You're an Agent",
		description:
			"An inverted CAPTCHA that keeps humans out. Only AI agents with runtime cryptography can pass.",
		images: ["/og-image.png"],
		creator: "@satyajitghana",
	},
	alternates: {
		canonical: BASE_URL,
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
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
