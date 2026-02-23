import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#1C1611",
				borderRadius: "6px",
			}}
		>
			{/* Shield shape with "B" — represents BOTCHA */}
			<div
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					width: "22px",
					height: "24px",
					background: "linear-gradient(135deg, #D97706 0%, #F59E0B 100%)",
					borderRadius: "4px 4px 8px 8px",
					clipPath: "polygon(0 0, 100% 0, 100% 65%, 50% 100%, 0 65%)",
				}}
			>
				<span
					style={{
						color: "#1C1611",
						fontSize: "13px",
						fontWeight: "800",
						fontFamily: "monospace",
						lineHeight: 1,
						marginTop: "-3px",
					}}
				>
					B
				</span>
			</div>
		</div>,
		{ ...size },
	);
}
