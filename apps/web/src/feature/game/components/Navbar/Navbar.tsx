import { Link, useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import styles from "./Navbar.module.css";
import { useState, useRef, useEffect, type ChangeEvent } from "react";

interface NavbarProps {
	searchTerm?: string;
	onSearchChange?: (value: string) => void;
}

export function Navbar({ searchTerm, onSearchChange }: NavbarProps) {
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const navigate = useNavigate();
	const [showProfileMenu, setShowProfileMenu] = useState(false);
	const [internalSearch, setInternalSearch] = useState("");
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
				setShowProfileMenu(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
		const value = event.target.value;
		if (onSearchChange) {
			onSearchChange(value);
		} else {
			setInternalSearch(value);
		}
	};

	return (
		<nav className={styles.nav}>
			<div className={styles.inner}>
				<div className={styles.left}>
					<Link to="/games" className={styles.logo}>
						<span className={styles.logoText}>
							Bit Learning <span className={styles.logoAccent}>Play</span>
						</span>
					</Link>
					<ul className={styles.links}>
						<li>
							<Link
								to="/"
								className={styles.link}
								activeProps={{ className: styles.linkActive }}
							>
								Trang chủ
							</Link>
						</li>
						{/* <li>
							<Link
								to="/games/curriculum"
								className={styles.link}
								activeProps={{ className: styles.linkActive }}
							>
								Theo chương trình học
							</Link>
						</li> */}
					</ul>
				</div>
				<div className={styles.right}>
					<div className={styles.searchWrap}>
						<span
							className="material-icons"
							style={{
								position: "absolute",
								left: 12,
								top: "50%",
								transform: "translateY(-50%)",
								color: "#94a3b8",
								fontSize: 20,
							}}
						>
							search
						</span>
						<input
							className={styles.search}
							type="text"
							placeholder="Tìm kiếm game..."
							value={searchTerm ?? internalSearch}
							onChange={handleSearchChange}
						/>
					</div>
					<button
						className={styles.notifBtn}
						onClick={() => navigate({ to: "/profile/notifications" })}
					>
						<span className="material-icons">notifications</span>
						<span className={styles.notifDot} />
					</button>
					{isAuthenticated && userInfo ? (
						<div className="relative" ref={menuRef}>
							<div
								className={styles.avatar}
								onClick={() => setShowProfileMenu(!showProfileMenu)}
							>
								<img src={userInfo.avatar} alt={userInfo.username} />
							</div>
							{showProfileMenu && (
								<div
									style={{
										position: "absolute",
										top: "calc(100% + 8px)",
										right: 0,
										width: 200,
										background: "rgba(15, 23, 42, 0.98)",
										borderRadius: 12,
										border: "1px solid rgba(148, 163, 184, 0.2)",
										boxShadow: "0 18px 45px rgba(0,0,0,0.6)",
										zIndex: 60,
										overflow: "hidden",
									}}
								>
									<div
										style={{
											padding: "12px 16px",
											borderBottom: "1px solid rgba(148,163,184,0.1)",
										}}
									>
										<p
											style={{
												fontSize: 14,
												fontWeight: 600,
												color: "#f1f5f9",
											}}
										>
											{userInfo.firstName} {userInfo.lastName}
										</p>
										<p style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
											@{userInfo.username}
										</p>
									</div>
									<button
										onClick={() => {
											setShowProfileMenu(false);
											navigate({ to: "/profile" });
										}}
										style={{
											display: "block",
											width: "100%",
											padding: "10px 16px",
											fontSize: 13,
											color: "#e2e8f0",
											textAlign: "left",
											background: "none",
											border: "none",
											cursor: "pointer",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "rgba(236,19,55,0.1)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "none")
										}
									>
										Hồ sơ cá nhân
									</button>
									<button
										onClick={() => {
											setShowProfileMenu(false);
											navigate({ to: "/" });
										}}
										style={{
											display: "block",
											width: "100%",
											padding: "10px 16px",
											fontSize: 13,
											color: "#e2e8f0",
											textAlign: "left",
											background: "none",
											border: "none",
											cursor: "pointer",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.background = "rgba(236,19,55,0.1)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.background = "none")
										}
									>
										Về trang chính
									</button>
								</div>
							)}
						</div>
					) : (
						<button
							type="button"
							className={"cursor-pointer"}
							onClick={() => navigate({ to: "/signin-role" })}
						>
							<span className="material-icons">login</span>
						</button>
					)}
				</div>
			</div>
		</nav>
	);
}
