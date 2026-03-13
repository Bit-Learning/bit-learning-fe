export // ─── Student SVG ──────────────────────────────────────────────────────────────
const StudentSVG = ({
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
			style={{ animation: "role-shadowPulse 3s ease-in-out infinite" }}
		/>

		<g
			ref={charRef}
			style={{
				transformOrigin: "85px 100px",
				animation:
					"role-float 3.4s ease-in-out infinite, role-charIn .6s .35s cubic-bezier(.22,1,.36,1) both",
			}}
		>
			{/* Backpack */}
			<g style={{ transformOrigin: "56px 120px" }}>
				<rect x="46" y="108" width="22" height="30" rx="5" fill="#475569" />
				<rect x="49" y="112" width="16" height="10" rx="2" fill="#334155" />
				<line
					x1="56"
					y1="108"
					x2="56"
					y2="138"
					stroke="#64748b"
					strokeWidth="1.5"
				/>
				<rect x="51" y="130" width="12" height="4" rx="2" fill="#64748b" />
			</g>
			{/* Body */}
			<rect x="62" y="108" width="46" height="46" rx="8" fill="#3b82f6" />
			<path d="M82 108 L85 116 L88 108" fill="#fff" opacity=".9" />
			<rect x="67" y="118" width="12" height="10" rx="2" fill="#2563eb" />
			<line
				x1="67"
				y1="123"
				x2="79"
				y2="123"
				stroke="#1d4ed8"
				strokeWidth="1"
			/>
			{/* Left arm + book */}
			<g style={{ transformOrigin: "66px 118px" }}>
				<rect x="50" y="110" width="18" height="10" rx="5" fill="#3b82f6" />
				<circle cx="51" cy="120" r="6" fill="#fbbf24" />
				<g
					style={{
						transformOrigin: "40px 128px",
						animation: "role-bookBob 2.8s ease-in-out infinite",
					}}
				>
					<rect x="32" y="118" width="24" height="30" rx="3" fill="#f97316" />
					<rect x="33" y="119" width="22" height="28" rx="2" fill="#fb923c" />
					<line
						x1="44"
						y1="119"
						x2="44"
						y2="147"
						stroke="#ea580c"
						strokeWidth="1.5"
					/>
					<line
						x1="36"
						y1="125"
						x2="42"
						y2="125"
						stroke="#fff"
						strokeWidth="1.2"
						opacity=".7"
					/>
					<line
						x1="36"
						y1="129"
						x2="42"
						y2="129"
						stroke="#fff"
						strokeWidth="1.2"
						opacity=".7"
					/>
					<line
						x1="36"
						y1="133"
						x2="42"
						y2="133"
						stroke="#fff"
						strokeWidth="1.2"
						opacity=".7"
					/>
				</g>
			</g>
			{/* Right arm waving */}
			<g
				style={{
					transformOrigin: "104px 116px",
					animation: "role-waveArm 3s 1s ease-in-out infinite",
				}}
			>
				<rect x="106" y="108" width="18" height="10" rx="5" fill="#3b82f6" />
				<circle cx="122" cy="116" r="6" fill="#fbbf24" />
				<line
					x1="126"
					y1="112"
					x2="128"
					y2="110"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="127"
					y1="115"
					x2="130"
					y2="114"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
				<line
					x1="126"
					y1="118"
					x2="129"
					y2="119"
					stroke="#f59e0b"
					strokeWidth="1.5"
					strokeLinecap="round"
				/>
			</g>
			{/* Legs & shoes */}
			<rect x="69" y="150" width="14" height="30" rx="5" fill="#1e293b" />
			<rect x="87" y="150" width="14" height="30" rx="5" fill="#1e293b" />
			<ellipse cx="76" cy="181" rx="10" ry="5" fill="#0f172a" />
			<ellipse cx="94" cy="181" rx="10" ry="5" fill="#0f172a" />
			<ellipse cx="73" cy="179" rx="4" ry="2" fill="#334155" opacity=".6" />
			<ellipse cx="91" cy="179" rx="4" ry="2" fill="#334155" opacity=".6" />
			{/* Neck */}
			<rect x="80" y="100" width="10" height="10" rx="3" fill="#fbbf24" />
			{/* Head */}
			<ellipse cx="85" cy="85" rx="26" ry="26" fill="#fbbf24" />
			<ellipse cx="59" cy="86" rx="5" ry="7" fill="#f59e0b" />
			<ellipse cx="111" cy="86" rx="5" ry="7" fill="#f59e0b" />
			{/* Hair */}
			<ellipse cx="85" cy="64" rx="26" ry="14" fill="#1e293b" />
			<rect x="59" y="64" width="52" height="14" fill="#1e293b" rx="2" />
			<path
				d="M63 70 Q60 62 65 58"
				stroke="#1e293b"
				strokeWidth="3"
				fill="none"
				strokeLinecap="round"
			/>
			<path
				d="M107 70 Q110 62 105 58"
				stroke="#1e293b"
				strokeWidth="3"
				fill="none"
				strokeLinecap="round"
			/>
			{/* Eyes */}
			<g
				ref={eyesRef}
				style={{
					animation: "role-blink 4s 2s ease-in-out infinite",
					transformOrigin: "85px 83px",
				}}
			>
				<ellipse cx="76" cy="83" rx="5" ry="5.5" fill="#1e293b" />
				<ellipse cx="94" cy="83" rx="5" ry="5.5" fill="#1e293b" />
				<circle cx="78" cy="81" r="1.5" fill="#fff" />
				<circle cx="96" cy="81" r="1.5" fill="#fff" />
			</g>
			{/* Smile & cheeks */}
			<path
				d="M75 92 Q85 100 95 92"
				stroke="#e67e22"
				strokeWidth="2.2"
				fill="none"
				strokeLinecap="round"
			/>
			<ellipse cx="69" cy="90" rx="5" ry="3" fill="#fca5a5" opacity=".5" />
			<ellipse cx="101" cy="90" rx="5" ry="3" fill="#fca5a5" opacity=".5" />
			{/* Grad cap */}
			<rect x="65" y="60" width="40" height="7" rx="2" fill="#1e293b" />
			<rect x="74" y="53" width="22" height="10" rx="2" fill="#1e293b" />
			<line
				x1="105"
				y1="60"
				x2="112"
				y2="72"
				stroke="#f97316"
				strokeWidth="2"
				strokeLinecap="round"
			/>
			<circle cx="112" cy="73" r="3" fill="#f97316" />
		</g>
	</svg>
);
