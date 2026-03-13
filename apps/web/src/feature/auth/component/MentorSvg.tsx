export // ─── Mentor SVG ───────────────────────────────────────────────────────────────
const MentorSVG = ({
	charRef,
	eyesRef,
}: {
	charRef: React.RefObject<SVGGElement | null>;
	eyesRef: React.RefObject<SVGGElement | null>;
}) => (
	<svg
		width="170"
		height="190"
		viewBox="0 0 170 190"
		xmlns="http://www.w3.org/2000/svg"
		style={{ overflow: "visible" }}
	>
		<ellipse
			cx="85"
			cy="184"
			rx="38"
			ry="6"
			fill="#94a3b8"
			style={{ animation: "role-shadowPulse 3.2s .3s ease-in-out infinite" }}
		/>

		<g
			ref={charRef}
			style={{
				transformOrigin: "85px 100px",
				animation:
					"role-floatSlow 4s .7s ease-in-out infinite, role-charIn .6s .45s cubic-bezier(.22,1,.36,1) both",
			}}
		>
			{/* Blazer */}
			<rect x="62" y="108" width="46" height="48" rx="8" fill="#4f46e5" />
			<path d="M85 108 L78 120 L85 118 L92 120 Z" fill="#f8fafc" />
			<path d="M85 118 L82 130 L85 134 L88 130 Z" fill="#f97316" />
			<circle cx="85" cy="136" r="1.8" fill="#3730a3" />
			<circle cx="85" cy="142" r="1.8" fill="#3730a3" />
			<path d="M96 116 L104 116 L103 112 L97 112 Z" fill="#e0f2fe" />
			{/* Left arm + pointer */}
			<g style={{ transformOrigin: "68px 116px" }}>
				<rect x="52" y="110" width="18" height="10" rx="5" fill="#4f46e5" />
				<circle cx="53" cy="122" r="6" fill="#fbbf24" />
				<g
					style={{
						transformOrigin: "46px 126px",
						animation: "role-pointerTap 2.5s ease-in-out infinite",
					}}
				>
					<line
						x1="46"
						y1="116"
						x2="34"
						y2="150"
						stroke="#1e293b"
						strokeWidth="2.5"
						strokeLinecap="round"
					/>
					<circle cx="34" cy="152" r="3" fill="#f97316" />
				</g>
			</g>
			{/* Right arm */}
			<g
				style={{
					transformOrigin: "102px 116px",
					animation: "role-waveArm 3.5s .5s ease-in-out infinite",
				}}
			>
				<rect x="100" y="110" width="18" height="10" rx="5" fill="#4f46e5" />
				<circle cx="117" cy="118" r="6" fill="#fbbf24" />
				<line
					x1="121"
					y1="114"
					x2="123"
					y2="111"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="122"
					y1="117"
					x2="125"
					y2="116"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="121"
					y1="121"
					x2="124"
					y2="122"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</g>
			{/* Whiteboard */}
			<g style={{ transformOrigin: "28px 128px" }}>
				<rect
					x="10"
					y="106"
					width="38"
					height="28"
					rx="3"
					fill="#f8fafc"
					stroke="#cbd5e1"
					strokeWidth="1.5"
				/>
				<rect x="10" y="130" width="38" height="5" rx="2" fill="#e2e8f0" />
				<rect
					x="15"
					y="126"
					width="5"
					height="8"
					rx="1"
					fill="#3b82f6"
					opacity=".7"
				/>
				<rect
					x="22"
					y="120"
					width="5"
					height="14"
					rx="1"
					fill="#3b82f6"
					opacity=".85"
				/>
				<rect x="29" y="115" width="5" height="19" rx="1" fill="#3b82f6" />
				<rect
					x="36"
					y="122"
					width="5"
					height="12"
					rx="1"
					fill="#8b5cf6"
					opacity=".8"
				/>
				<line
					x1="29"
					y1="134"
					x2="25"
					y2="145"
					stroke="#94a3b8"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="29"
					y1="134"
					x2="33"
					y2="145"
					stroke="#94a3b8"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</g>
			{/* Legs & shoes */}
			<rect x="69" y="152" width="14" height="28" rx="5" fill="#1e293b" />
			<rect x="87" y="152" width="14" height="28" rx="5" fill="#1e293b" />
			<ellipse cx="76" cy="181" rx="11" ry="5" fill="#0f172a" />
			<ellipse cx="94" cy="181" rx="11" ry="5" fill="#0f172a" />
			<ellipse cx="73" cy="179" rx="4" ry="2" fill="#334155" opacity=".6" />
			<ellipse cx="91" cy="179" rx="4" ry="2" fill="#334155" opacity=".6" />
			{/* Neck */}
			<rect x="80" y="100" width="10" height="10" rx="3" fill="#fbbf24" />
			{/* Head */}
			<ellipse cx="85" cy="85" rx="26" ry="26" fill="#fbbf24" />
			<ellipse cx="59" cy="86" rx="5" ry="7" fill="#f59e0b" />
			<ellipse cx="111" cy="86" rx="5" ry="7" fill="#f59e0b" />
			{/* Hair */}
			<ellipse cx="85" cy="64" rx="26" ry="12" fill="#1e293b" />
			<rect x="59" y="64" width="52" height="11" fill="#1e293b" rx="2" />
			<path
				d="M75 60 Q78 56 82 59"
				stroke="#374151"
				strokeWidth="2.5"
				fill="none"
				strokeLinecap="round"
			/>
			{/* Glasses */}
			<g fill="none" stroke="#1e293b" strokeWidth="2">
				<rect x="68" y="78" width="14" height="11" rx="4" />
				<rect x="88" y="78" width="14" height="11" rx="4" />
				<line x1="82" y1="83" x2="88" y2="83" />
				<line x1="68" y1="83" x2="62" y2="84" />
				<line x1="102" y1="83" x2="108" y2="84" />
			</g>
			{/* Eyes */}
			<g
				ref={eyesRef}
				style={{
					animation: "role-blink 5s 1s ease-in-out infinite",
					transformOrigin: "85px 83px",
				}}
			>
				<ellipse cx="75" cy="83" rx="4" ry="4.5" fill="#1e293b" />
				<ellipse cx="95" cy="83" rx="4" ry="4.5" fill="#1e293b" />
				<circle cx="77" cy="81" r="1.3" fill="#fff" />
				<circle cx="97" cy="81" r="1.3" fill="#fff" />
			</g>
			{/* Smile & cheeks */}
			<path
				d="M76 93 Q85 101 94 93"
				stroke="#e67e22"
				strokeWidth="2.2"
				fill="none"
				strokeLinecap="round"
			/>
			<ellipse cx="69" cy="91" rx="5" ry="3" fill="#fca5a5" opacity=".4" />
			<ellipse cx="101" cy="91" rx="5" ry="3" fill="#fca5a5" opacity=".4" />
		</g>
	</svg>
);
