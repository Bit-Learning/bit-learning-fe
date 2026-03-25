import { Link, useNavigate } from "@tanstack/react-router";
import { useSelector } from "react-redux";
import { navItems } from "@/layouts/data/nav-items";
import { selectAuthStateInfo } from "@/feature/auth/store/auth.selectors";
import type { GameCategory } from "../services/gameService";
import styles from "./Navbar.module.css";

export function Navbar() {
	const { isAuthenticated, userInfo } = useSelector(selectAuthStateInfo);
	const navigate = useNavigate();

	return (
		<nav className={styles.nav}>
			<div className={styles.inner}>
				<div className={styles.left}>
					<Link to="/games" className={styles.logo}>
						<span className={styles.logoIcon}>
							<span className="material-icons">videogame_asset</span>
						</span>
						<span className={styles.logoText}>
							Bit Learning<span className={styles.logoAccent}>Play</span>
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
						<li>
							<Link
								to="/leaderboard"
								className={styles.link}
								activeProps={{ className: styles.linkActive }}
							>
								Bảng xếp hạng
							</Link>
						</li>
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
							placeholder="Titles, genres..."
						/>
					</div>
					<button className={styles.notifBtn}>
						<span className="material-icons">notifications</span>
						<span className={styles.notifDot} />
					</button>
					{isAuthenticated && userInfo ? (
						<div className={styles.avatar}>
							<img src={userInfo.avatar} alt={userInfo.username} />
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
