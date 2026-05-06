import React from "react";

interface BitCoinIconProps {
	size?: number;
	className?: string;
	style?: React.CSSProperties;
}

const BitCoinIcon: React.FC<BitCoinIconProps> = ({
	size = 120,
	className,
	style,
}) => {
	const id = React.useId().replace(/:/g, "");

	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			viewBox="0 0 120 120"
			width={size}
			height={size}
			className={className}
			style={style}
		>
			<defs>
				<radialGradient id={`coinBody-${id}`} cx="38%" cy="32%" r="65%">
					<stop offset="0%" stopColor="#FFF2A6" />
					<stop offset="45%" stopColor="#E0A800" />
					<stop offset="100%" stopColor="#8A5A00" />
				</radialGradient>

				<radialGradient id={`coinInner-${id}`} cx="40%" cy="35%" r="60%">
					<stop offset="0%" stopColor="#F7C948" />
					<stop offset="100%" stopColor="#B87400" />
				</radialGradient>

				<radialGradient id={`coinShine-${id}`} cx="30%" cy="25%" r="55%">
					<stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.6" />
					<stop offset="100%" stopColor="#FFD36A" stopOpacity="0" />
				</radialGradient>
				<filter
					id={`shadow-${id}`}
					x="-20%"
					y="-20%"
					width="140%"
					height="140%"
				>
					<feDropShadow
						dx="2"
						dy="4"
						stdDeviation="4"
						floodColor="#8B5E00"
						floodOpacity="0.45"
					/>
				</filter>
				<linearGradient id={`edge-${id}`} x1="0" y1="0" x2="1" y2="1">
					<stop offset="0%" stopColor="#B8780A" />
					<stop offset="100%" stopColor="#7A4C00" />
				</linearGradient>
				<linearGradient id={`textGrad-${id}`} x1="0" y1="0" x2="0" y2="1">
					<stop offset="0%" stopColor="#FFB000" />
					<stop offset="100%" stopColor="#6A2E00" />
				</linearGradient>
			</defs>

			<ellipse
				cx="62"
				cy="63"
				rx="46"
				ry="46"
				fill={`url(#edge-${id})`}
				filter={`url(#shadow-${id})`}
			/>

			<circle cx="59" cy="59" r="46" fill={`url(#coinBody-${id})`} />

			<circle
				cx="59"
				cy="59"
				r="38"
				fill="none"
				stroke="#C47F00"
				strokeWidth="2.5"
				opacity="0.6"
			/>
			<circle
				cx="59"
				cy="59"
				r="36"
				fill="none"
				stroke="#FFE066"
				strokeWidth="1"
				opacity="0.5"
			/>

			<circle cx="59" cy="59" r="34" fill={`url(#coinInner-${id})`} />

			<text
				x="59"
				y="66"
				textAnchor="middle"
				fontFamily="'Arial Black', Arial, sans-serif"
				fontSize="26"
				fontWeight="1000"
				letterSpacing="1"
				fill={`url(#textGrad-${id})`}
				stroke="#3A1200"
				strokeWidth="1.2"
				paintOrder="stroke fill"
			>
				BIT
			</text>

			<circle cx="59" cy="59" r="46" fill={`url(#coinShine-${id})`} />

			<path
				d="M30 40 Q59 22 88 40"
				fill="none"
				stroke="white"
				strokeWidth="3"
				strokeLinecap="round"
				opacity="0.35"
			/>
		</svg>
	);
};

export default BitCoinIcon;
