import PageMeta from "@/shared/components/seo/page-meta";
import { useNavigate } from "@tanstack/react-router";
import { useCallback, useEffect, useRef } from "react";
import { MentorSVG } from "../component/MentorSvg";
import { StudentSVG } from "../component/StudentSvg";
import AuthLayout from "../layout/AuthLayout";

// ─── keyframe styles injected once ────────────────────────────────────────────
const GLOBAL_STYLES = `
  @keyframes role-float      { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-6px)} }
  @keyframes role-floatSlow  { 0%,100%{transform:translateY(0)}  50%{transform:translateY(-8px)} }
  @keyframes role-waveArm    { 0%,100%{transform:rotate(0deg)}   40%{transform:rotate(-22deg)}  70%{transform:rotate(8deg)} }
  @keyframes role-bookBob    { 0%,100%{transform:translateY(0) rotate(0deg)} 50%{transform:translateY(-3px) rotate(2deg)} }
  @keyframes role-pointerTap { 0%,100%{transform:translateY(0) rotate(-8deg)} 50%{transform:translateY(-4px) rotate(-15deg)} }
  @keyframes role-blink      { 0%,92%,100%{transform:scaleY(1)} 96%{transform:scaleY(.1)} }
  @keyframes role-shadowPulse{ 0%,100%{transform:scaleX(1);opacity:.18} 50%{transform:scaleX(.82);opacity:.1} }
  @keyframes role-charIn     { from{opacity:0;transform:translateY(16px) scale(.92)} to{opacity:1;transform:translateY(0) scale(1)} }
  @keyframes role-fadeDown   { from{opacity:0;transform:translateY(-14px)} to{opacity:1;transform:translateY(0)} }
  @keyframes role-fadeUp     { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
  @keyframes role-badgePulse { 0%,100%{box-shadow:0 0 0 0 rgba(99,102,241,.15)} 50%{box-shadow:0 0 0 6px rgba(99,102,241,0)} }
  @keyframes role-dotPulse   { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.5;transform:scale(.75)} }
  @keyframes role-ripple     { to { transform:scale(1); opacity:0; } }

  .role-card-student:hover {
  box-shadow:
    0 0 0 2px var(--primary),
    0 20px 48px -12px color-mix(in srgb, var(--primary) 22%, transparent);
  border-color: transparent !important;
}

.role-card-mentor:hover {
  box-shadow:
    0 0 0 2px var(--primary-orange),
    0 20px 48px -12px color-mix(in srgb, var(--primary-orange) 22%, transparent);
  border-color: transparent !important;
}

/* Title */
.role-card-student:hover .role-card-title {
  color: var(--primary) !important;
}

.role-card-mentor:hover .role-card-title {
  color: var(--primary-orange) !important;
}

/* CTA */
.role-card-student:hover .role-card-cta {
  background: var(--primary) !important;
  border-color: var(--primary) !important;
  color: #fff !important;
  gap: 10px !important;
}

.role-card-mentor:hover .role-card-cta {
  background: var(--primary-orange) !important;
  border-color: var(--primary-orange) !important;
  color: #fff !important;
  gap: 10px !important;
}

	/* Mobile tweaks */
	@media (max-width: 640px) {
		.role-select-wrapper {
			padding-left: 1.25rem;
			padding-right: 1.25rem;
			padding-top: 1rem;
			padding-bottom: 1rem;
		}

		.role-select-title {
			font-size: 22px !important;
		}

		.role-select-subtitle {
			font-size: 14px !important;
		}

		.role-card {
			padding: 24px 20px 22px !important;
		}

		.role-card-blob {
			width: 96px;
			height: 96px;
			top: -28px;
			right: -28px;
		}
	}
`;

// ─── Mouse-tracking hook ───────────────────────────────────────────────────────
function useCharacterMouseTracking(
	cardRef: React.RefObject<HTMLElement | null>,
	charRef: React.RefObject<SVGGElement | null>,
	eyesRef: React.RefObject<SVGGElement | null>,
) {
	const rafRef = useRef<number>(0);
	const currentPos = useRef({ x: 0, y: 0 });

	useEffect(() => {
		const card = cardRef.current;
		const char = charRef.current;
		const eyes = eyesRef.current;
		if (!card || !char || !eyes) return;

		const onMove = (e: MouseEvent) => {
			const rect = card.getBoundingClientRect();
			const mx = e.clientX - rect.left - rect.width / 2;
			const my = e.clientY - rect.top - rect.height / 2;
			const tx = Math.max(-6, Math.min(6, mx * 0.04));
			const ty = Math.max(-4, Math.min(4, my * 0.03));
			const ex = Math.max(-2, Math.min(2, mx * 0.012));
			const ey = Math.max(-2, Math.min(2, my * 0.012));
			currentPos.current = { x: tx, y: ty };
			cancelAnimationFrame(rafRef.current);
			rafRef.current = requestAnimationFrame(() => {
				char.style.transform = `translate(${tx}px, ${ty}px)`;
				eyes.style.transform = `translate(${ex}px, ${ey}px)`;
			});
		};

		const onLeave = () => {
			cancelAnimationFrame(rafRef.current);
			let frames = 0;
			const snapBack = () => {
				frames++;
				const t = Math.min(frames / 18, 1);
				const ease = 1 - (1 - t) ** 3;
				const nx = currentPos.current.x * (1 - ease);
				const ny = currentPos.current.y * (1 - ease);
				char.style.transform = `translate(${nx}px, ${ny}px)`;
				eyes.style.transform = "translate(0, 0)";
				if (t < 1) rafRef.current = requestAnimationFrame(snapBack);
				else {
					char.style.transform = "";
					eyes.style.transform = "";
				}
			};
			rafRef.current = requestAnimationFrame(snapBack);
		};

		card.addEventListener("mousemove", onMove);
		card.addEventListener("mouseleave", onLeave);
		return () => {
			card.removeEventListener("mousemove", onMove);
			card.removeEventListener("mouseleave", onLeave);
			cancelAnimationFrame(rafRef.current);
		};
	}, [cardRef, charRef, eyesRef]);
}

// ─── Ripple hook ──────────────────────────────────────────────────────────────
function useRipple(cardRef: React.RefObject<HTMLElement | null>) {
	return useCallback(
		(e: React.MouseEvent<HTMLElement>) => {
			const card = cardRef.current;
			if (!card) return;
			const rect = card.getBoundingClientRect();
			const size = Math.max(rect.width, rect.height) * 1.4;
			const ripple = document.createElement("span");
			ripple.style.cssText = `
      position:absolute;border-radius:50%;pointer-events:none;
      width:${size}px;height:${size}px;
      left:${e.clientX - rect.left - size / 2}px;
      top:${e.clientY - rect.top - size / 2}px;
      background:rgba(99,102,241,.12);
      transform:scale(0);animation:role-ripple .55s ease-out forwards;
    `;
			card.appendChild(ripple);
			setTimeout(() => ripple.remove(), 600);
		},
		[cardRef],
	);
}

// ─── Role Card ────────────────────────────────────────────────────────────────
interface RoleCardProps {
	variant: "student" | "mentor";
	title: string;
	animationDelay: string;
	onClick: (e: React.MouseEvent<HTMLDivElement>) => void;
}

const RoleCard: React.FC<RoleCardProps> = ({
	variant,
	title,
	animationDelay,
	onClick,
}) => {
	const cardRef = useRef<HTMLDivElement>(null);
	const charRef = useRef<SVGGElement>(null);
	const eyesRef = useRef<SVGGElement>(null);

	useCharacterMouseTracking(cardRef, charRef, eyesRef);
	const handleRipple = useRipple(cardRef);

	const isStudent = variant === "student";

	const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
		handleRipple(e);
		onClick(e);
	};

	return (
		<div
			ref={cardRef}
			onClick={handleClick}
			className={`role-card role-card-${variant}`}
			style={{
				border: "1.5px solid #f1f5f9",
				borderRadius: "20px",
				padding: "32px 28px 28px",
				cursor: "pointer",
				display: "flex",
				flexDirection: "column",
				alignItems: "center",
				textAlign: "center",
				position: "relative",
				overflow: "hidden",
				background: "#fff",
				transition: "border-color .25s, box-shadow .3s",
				animation: `role-fadeUp .55s ${animationDelay} cubic-bezier(.22,1,.36,1) both`,
			}}
		>
			{/* Shimmer pseudo-element via before */}
			<style>{`
        .role-card::after {
          content: ''; position: absolute; inset: 0;
          background: linear-gradient(120deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%);
          transform: translateX(-100%);
          transition: transform .55s ease;
          pointer-events: none;
        }
      `}</style>

			{/* BG blob */}
			<div
				className="role-card-blob"
				style={{
					position: "absolute",
					top: "-36px",
					right: "-36px",
					width: "120px",
					height: "120px",
					borderRadius: "50%",
					background: isStudent ? "#3b82f6" : "#8b5cf6",
					opacity: 0.07,
					transition: "transform .45s ease, opacity .45s ease",
					pointerEvents: "none",
				}}
			/>

			{/* Illustration */}
			<div
				style={{
					width: "200px",
					height: "200px",
					borderRadius: "50%",
					background: "#f8fafc",
					border: "1px solid #f1f5f9",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					marginBottom: "24px",
					overflow: "visible",
					position: "relative",
				}}
			>
				{isStudent ? (
					<StudentSVG charRef={charRef} eyesRef={eyesRef} />
				) : (
					<MentorSVG charRef={charRef} eyesRef={eyesRef} />
				)}
			</div>

			{/* Title */}
			<h2
				className="role-card-title"
				style={{
					fontSize: "16px",
					fontWeight: 700,
					color: "#334155",
					marginBottom: "6px",
					transition: "color .2s",
				}}
			>
				{title}
			</h2>
		</div>
	);
};

// ─── Page ─────────────────────────────────────────────────────────────────────
const RoleSelectPage: React.FC = () => {
	const navigate = useNavigate();

	// Inject global keyframes once
	useEffect(() => {
		const id = "role-select-styles";
		if (document.getElementById(id)) return;
		const tag = document.createElement("style");
		tag.id = id;
		tag.textContent = GLOBAL_STYLES;
		document.head.appendChild(tag);
		return () => {
			document.getElementById(id)?.remove();
		};
	}, []);

	return (
		<>
			<PageMeta
				title="Chọn vai trò đăng nhập - Bit Learning"
				description="Chọn vai trò của bạn để tiếp tục đăng nhập vào Bit Learning"
			/>
			<AuthLayout showBackGround={false}>
				<div className="flex h-full w-full items-center justify-center px-4 sm:px-6">
					<div className="w-full max-w-3xl">
						{/* Header */}
						<div
							className="role-select-wrapper"
							style={{
								textAlign: "center",
								marginBottom: "40px",
								animation:
									"role-fadeDown .5s .08s cubic-bezier(.22,1,.36,1) both",
							}}
						>
							<h1
								className="role-select-title"
								style={{
									fontSize: "28px",
									fontWeight: 800,
									color: "#0f172a",
									lineHeight: 1.3,
									marginBottom: "8px",
								}}
							>
								Bạn muốn bắt đầu với vai trò nào?
							</h1>
							<p
								className="role-select-subtitle"
								style={{ fontSize: "15px", color: "#64748b", fontWeight: 500 }}
							>
								Tôi là...
							</p>
						</div>

						{/* Cards */}
						<div className="grid grid-cols-1 gap-6 md:grid-cols-2">
							<RoleCard
								variant="student"
								title="Học viên"
								animationDelay=".18s"
								onClick={() => navigate({ to: "/signin" })}
							/>
							<RoleCard
								variant="mentor"
								title="Giáo viên"
								animationDelay=".26s"
								onClick={() => navigate({ to: "/mentor/signin" })}
							/>
						</div>
					</div>
				</div>
			</AuthLayout>
		</>
	);
};

export default RoleSelectPage;
