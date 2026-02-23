import type { MetadataRoute } from "next";

const BASE_URL = "https://botcha-verify.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
	return [
		{
			url: BASE_URL,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 1,
		},
		{
			url: `${BASE_URL}/api`,
			lastModified: new Date(),
			changeFrequency: "weekly",
			priority: 0.8,
		},
	];
}
