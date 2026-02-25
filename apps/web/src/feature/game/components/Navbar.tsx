import { Link } from "@tanstack/react-router";
import styles from "./Navbar.module.css";

export function Navbar() {
	return (
		<nav className={styles.nav}>
			<div className={styles.inner}>
				<div className={styles.left}>
					<Link to="/" className={styles.logo}>
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
								Home
							</Link>
						</li>
						<li>
							<a className={styles.link} href="#">
								Categories
							</a>
						</li>
						<li>
							<a className={styles.link} href="#">
								My Favorites
							</a>
						</li>
						<li>
							<a className={styles.link} href="#">
								New &amp; Popular
							</a>
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
					<div className={styles.avatar}>
						<img
							src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZ8oIbJJT6eVKJ5Vrd-3rmK55Ai4hYdYyXjdUbJvtpHbkZhcY1EP92gwMiB6JZcPgGGJP7i-RIOz0Ekz_Ub-5ylt07qy7-zytog0FbvKq5cdPDQjjy4YUbda-E45BI_tVPgyk6CDwi_jXBMDyZBjfwBBUV-Huu-wwV4OobJobyFKrnT3ZXKkQLNeJSErhHnXBwosXDm9h1L074Oi85sNqYe6jChdrpkQ4FR-1px9-SE-9LLN_hkn8cjNyZcufAdTTKKKWvt36PgB_I"
							alt="User"
						/>
					</div>
				</div>
			</div>
		</nav>
	);
}
