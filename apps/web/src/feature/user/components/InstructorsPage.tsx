import { useState } from "react";
import { useInstructors } from "../queries/useUser";
import {
	Avatar,
	AvatarImage,
	AvatarFallback,
} from "@workspace/ui/components/Avatar";
import {
	ChevronLeft,
	ChevronRight,
	Github,
	Linkedin,
	Globe,
	Mail,
} from "lucide-react";
import type { TInstructor } from "../types/user.type";
import Loader from "@workspace/ui/components/loader/TerminalLoader";

// ─── Instructor Card ────────────────────────────────────────────────────────

function InstructorCard({ instructor }: { instructor: TInstructor }) {
	return (
		<div className="instructor-card">
			{/* Full-bleed photo area */}
			<div className="card-photo">
				{instructor.coverImage ? (
					<img src={instructor.coverImage} alt="" className="cover-img" />
				) : (
					<div className="cover-fallback" />
				)}
				<div className="cover-overlay" />

				{/* Social icons float over photo */}
				<div className="photo-socials">
					{instructor.email && (
						<a
							href={`mailto:${instructor.email}`}
							className="social-btn"
							aria-label="Email"
						>
							<Mail size={14} />
						</a>
					)}
					{instructor.socialProfile?.github && (
						<a
							href={instructor.socialProfile.github}
							target="_blank"
							rel="noopener noreferrer"
							className="social-btn"
							aria-label="GitHub"
						>
							<Github size={14} />
						</a>
					)}
					{instructor.socialProfile?.linkedin && (
						<a
							href={instructor.socialProfile.linkedin}
							target="_blank"
							rel="noopener noreferrer"
							className="social-btn"
							aria-label="LinkedIn"
						>
							<Linkedin size={14} />
						</a>
					)}
					{instructor.socialProfile?.website && (
						<a
							href={instructor.socialProfile.website}
							target="_blank"
							rel="noopener noreferrer"
							className="social-btn"
							aria-label="Website"
						>
							<Globe size={14} />
						</a>
					)}
				</div>
			</div>

			{/* Avatar punches through the photo/content boundary */}
			<div className="card-avatar-wrap">
				<Avatar className="card-avatar">
					<AvatarImage src={instructor.avatar} />
					<AvatarFallback className="avatar-fallback">
						{instructor.firstName?.charAt(0) ?? "M"}
					</AvatarFallback>
				</Avatar>
			</div>

			{/* Text content */}
			<div className="card-body">
				<h3 className="instructor-name">
					{instructor.firstName} {instructor.lastName}
				</h3>
				{instructor.jobTitle && (
					<p className="instructor-title">{instructor.jobTitle}</p>
				)}
				{instructor.bio && <p className="instructor-bio">{instructor.bio}</p>}
			</div>
		</div>
	);
}

// ─── Page ───────────────────────────────────────────────────────────────────

export default function InstructorsPage() {
	const [page, setPage] = useState(0);
	const { data, isLoading } = useInstructors(page, 12);

	const instructors: TInstructor[] = data?.content ?? [];
	const totalPages = data?.totalPages ?? 0;
	const totalInstructors = data?.totalElements ?? 0;

	return (
		<>
			<style>{`
        /* ── Tokens ── */
        :root {
          --ink:    #0d0f14;
          --ink2:   #1e2230;
          --muted:  #6b7280;
          --border: rgba(255,255,255,0.08);
          --accent: #4f7fff;
          --accent2:#7c5cfc;
          --gold:   #f5c842;
          --card-bg:#ffffff;
          --radius: 20px;
          font-family: 'DM Sans', 'Helvetica Neue', sans-serif;
        }

        /* ── Hero ── */
        .hero {
          position: relative;
          overflow: hidden;
          background: var(--ink);
          padding: 96px 24px 80px;
          text-align: center;
        }
        .hero::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 80% 60% at 20% 50%, rgba(79,127,255,0.22) 0%, transparent 70%),
            radial-gradient(ellipse 60% 80% at 80% 30%, rgba(124,92,252,0.18) 0%, transparent 60%);
          pointer-events: none;
        }
        /* Decorative grid lines */
        .hero::after {
          content: '';
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 48px 48px;
          pointer-events: none;
        }
        .hero-inner {
          position: relative;
          z-index: 1;
          max-width: 640px;
          margin: 0 auto;
        }
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: rgba(79,127,255,0.15);
          border: 1px solid rgba(79,127,255,0.3);
          color: #93b4ff;
          font-size: 12px;
          font-weight: 600;
          letter-spacing: .08em;
          text-transform: uppercase;
          padding: 6px 14px;
          border-radius: 999px;
          margin-bottom: 24px;
        }
        .hero-badge-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--accent);
          box-shadow: 0 0 8px var(--accent);
          animation: pulse-dot 2s ease-in-out infinite;
        }
        @keyframes pulse-dot {
          0%,100% { opacity:1; transform:scale(1); }
          50%      { opacity:.5; transform:scale(1.4); }
        }
        .hero h1 {
          font-family: 'Fraunces', 'Georgia', serif;
          font-size: clamp(2.4rem, 5vw, 3.8rem);
          font-weight: 800;
          color: #fff;
          line-height: 1.1;
          letter-spacing: -.02em;
          margin: 0 0 16px;
        }
        .hero h1 em {
          font-style: normal;
          background: linear-gradient(90deg, var(--accent), var(--accent2));
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .hero-sub {
          color: rgba(255,255,255,0.55);
          font-size: 1.05rem;
          line-height: 1.7;
          margin: 0 auto;
          max-width: 500px;
        }
        .hero-count {
          margin-top: 32px;
          display: inline-flex;
          align-items: center;
          gap: 32px;
        }
        .hero-stat {
          text-align: center;
        }
        .hero-stat-num {
          display: block;
          font-size: 1.6rem;
          font-weight: 700;
          color: #fff;
          font-variant-numeric: tabular-nums;
        }
        .hero-stat-label {
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: .08em;
          color: rgba(255,255,255,0.4);
        }
        .hero-divider {
          width: 1px;
          height: 36px;
          background: rgba(255,255,255,0.12);
        }

        /* ── Layout ── */
        .page-wrap {
          background: #f5f6fa;
          min-height: 60vh;
          padding: 56px 24px 72px;
        }
        .grid-wrap {
          max-width: 1280px;
          margin: 0 auto;
        }
        .instructors-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
          gap: 24px;
        }

        /* ── Card ── */
        .instructor-card {
          position: relative;
          background: var(--card-bg);
          border-radius: var(--radius);
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,.07), 0 8px 24px rgba(0,0,0,.05);
          transition: transform .25s ease, box-shadow .25s ease;
          cursor: default;
        }
        .instructor-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 4px 12px rgba(0,0,0,.08), 0 20px 48px rgba(0,0,0,.12);
        }
        .instructor-card:hover .photo-socials {
          opacity: 1;
          transform: translateY(0);
        }
        .instructor-card:hover .cover-overlay {
          opacity: .7;
        }

        /* Photo */
        .card-photo {
          position: relative;
          height: 160px;
          background: linear-gradient(135deg, #2c3e7a, #6b45c8);
          overflow: hidden;
        }
        .cover-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform .4s ease;
        }
        .instructor-card:hover .cover-img {
          transform: scale(1.05);
        }
        .cover-fallback {
          width: 100%;
          height: 100%;
          background:
            linear-gradient(135deg,
              hsl(calc(200 + var(--hue, 0) * 1deg), 60%, 35%),
              hsl(calc(260 + var(--hue, 0) * 1deg), 70%, 45%)
            );
        }
        .cover-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(10,12,20,.85) 0%, transparent 60%);
          opacity: .45;
          transition: opacity .3s;
        }

        /* Floating social icons */
        .photo-socials {
          position: absolute;
          top: 12px;
          right: 12px;
          display: flex;
          gap: 6px;
          opacity: 0;
          transform: translateY(-6px);
          transition: opacity .25s ease, transform .25s ease;
        }
        .social-btn {
          display: grid;
          place-items: center;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255,255,255,0.15);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          text-decoration: none;
          transition: background .2s, transform .2s;
        }
        .social-btn:hover {
          background: rgba(255,255,255,0.3);
          transform: scale(1.15);
        }

        /* Avatar */
        .card-avatar-wrap {
          position: relative;
          z-index: 10;
          margin: 5px 0 0 20px;
          width: fit-content;
        }
        .card-avatar {
          width: 64px !important;
          height: 64px !important;
          border: 3px solid #fff;
        }
        .avatar-fallback {
          background: linear-gradient(135deg, var(--accent), var(--accent2)) !important;
          color: #fff !important;
          font-weight: 700 !important;
          font-size: 1.2rem !important;
        }

        /* Body */
        .card-body {
          padding: 12px 20px 20px;
        }
        .instructor-name {
          font-weight: 700;
          font-size: 1.05rem;
          color: var(--ink);
          margin: 0 0 2px;
          letter-spacing: -.01em;
        }
        .instructor-title {
          font-size: .78rem;
          font-weight: 600;
          color: var(--accent);
          text-transform: uppercase;
          letter-spacing: .06em;
          margin: 0 0 10px;
        }
        .instructor-bio {
          font-size: .84rem;
          color: var(--muted);
          line-height: 1.6;
          margin: 0 0 14px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        /* ── Loading ── */
        .loading-state {
          text-align: center;
          padding: 80px 0;
          color: var(--muted);
        }
        .loading-dots {
          display: flex;
          justify-content: center;
          gap: 8px;
          margin-bottom: 16px;
        }
        .loading-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--accent);
          animation: bounce-dot 1.2s ease-in-out infinite;
        }
        .loading-dot:nth-child(2) { animation-delay: .2s; }
        .loading-dot:nth-child(3) { animation-delay: .4s; }
        @keyframes bounce-dot {
          0%,80%,100% { transform: scale(0.6); opacity:.4; }
          40%          { transform: scale(1);   opacity:1;  }
        }

        /* ── Pagination ── */
        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 12px;
          margin-top: 52px;
        }
        .page-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 20px;
          border-radius: 12px;
          border: 1.5px solid #e0e2ea;
          background: #fff;
          font-size: .875rem;
          font-weight: 600;
          color: var(--ink2);
          cursor: pointer;
          transition: all .2s ease;
        }
        .page-btn:hover:not(:disabled) {
          border-color: var(--accent);
          color: var(--accent);
          background: rgba(79,127,255,.04);
        }
        .page-btn:disabled {
          opacity: .35;
          cursor: not-allowed;
        }
        .page-info {
          font-size: .85rem;
          font-weight: 500;
          color: var(--muted);
          padding: 10px 16px;
          background: #fff;
          border: 1.5px solid #e0e2ea;
          border-radius: 12px;
          min-width: 110px;
          text-align: center;
        }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .hero { padding: 64px 20px 56px; }
          .hero h1 { font-size: 2rem; }
          .hero-count { gap: 20px; }
          .instructors-grid { grid-template-columns: 1fr; }
        }
      `}</style>

			{/* ── Hero ── */}
			<div className="hero">
				<div className="hero-inner">
					<h1>
						Học cùng <em>chuyên gia</em>
						<br />
						hàng đầu
					</h1>
					<p className="hero-sub">
						Gặp gỡ những mentor tài năng và giàu kinh nghiệm. Họ sẵn sàng đồng
						hành cùng bạn trên hành trình chinh phục công nghệ.
					</p>
					<div className="hero-count">
						<div className="hero-stat">
							<span className="hero-stat-num">{totalInstructors}</span>
							<span className="hero-stat-label">Giảng viên</span>
						</div>
					</div>
				</div>
			</div>

			{/* ── Grid ── */}
			<div className="page-wrap">
				<div className="grid-wrap">
					{isLoading ? (
						<Loader />
					) : instructors.length === 0 ? (
						<div className="loading-state">
							<p>Chưa có giảng viên nào.</p>
						</div>
					) : (
						<>
							<div className="instructors-grid">
								{instructors.map((instructor) => (
									<InstructorCard key={instructor.id} instructor={instructor} />
								))}
							</div>

							{totalPages > 1 && (
								<div className="pagination">
									<button
										className="page-btn"
										onClick={() => setPage((p) => Math.max(0, p - 1))}
										disabled={page === 0}
									>
										<ChevronLeft size={16} /> Trước
									</button>
									<span className="page-info">
										Trang {page + 1} / {totalPages}
									</span>
									<button
										className="page-btn"
										onClick={() =>
											setPage((p) => Math.min(totalPages - 1, p + 1))
										}
										disabled={page >= totalPages - 1}
									>
										Sau <ChevronRight size={16} />
									</button>
								</div>
							)}
						</>
					)}
				</div>
			</div>
		</>
	);
}
